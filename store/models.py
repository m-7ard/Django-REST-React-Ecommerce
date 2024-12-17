from datetime import datetime, timedelta
from collections import defaultdict

from django.core.exceptions import ValidationError, PermissionDenied
from django.db import models, IntegrityError
from django.db.models.query import Q
from django.contrib.sessions.models import Session

from users.models import CustomUser, Address, BankAccount
from .validators import BasicJsonValidator


class Category(models.Model):
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        related_name="subcategories",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=30, unique=True)

    def save(self, *args, **kwargs):
        creating = self._state.adding
        if creating and self.parent == None:
            existing_base_category = Category.objects.filter(parent=None).first()
            if existing_base_category:
                raise ValidationError("There can exist only one base category.")

        super().save(*args, **kwargs)

    def __str__(self):
        if self.parent:
            return f"{self.parent.__str__()} > {self.name}"
        else:
            return self.name


def ad_default_expiry_date():
    return datetime.now() + timedelta(days=30)


class AdGroup(models.Model):
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='ad_groups')
    name = models.CharField(max_length=64)

    @property
    def options(self):
        grouped_specification = defaultdict(set)

        for specification in self.ads.values_list('specifications', flat=True):
            for key, value in specification.items():
                grouped_specification[key].add(value)
        
        return dict(grouped_specification)

    def save(self, *args, **kwargs):
        if self.name in self.created_by.ad_groups.values_list('name', flat=True):
            raise ValidationError(
                "Name must be unique."
            )
        
        super().save(*args, **kwargs)


class Ad(models.Model):
    RETURN_POLICIES = (
        ('7_days', '7 Days Return Policy'),
        ('30_days', '30 Days Return Policy'),
        ('warranty', 'Warranty Period Policy'),
    )
    CONDITIONS = (
        ('new', 'New'),
        ('almost_new', 'Almost New'),    
        ('used', 'Used'),
        ('damaged', 'Damaged'),
    )
    title = models.CharField(max_length=64)
    description = models.CharField(max_length=4096, blank=True)
    price = models.DecimalField(max_digits=20, decimal_places=2)
    shipping = models.DecimalField(max_digits=20, decimal_places=2)
    return_policy = models.CharField(max_length=30, choices=RETURN_POLICIES)
    condition = models.CharField(max_length=30, choices=CONDITIONS, blank=True)
    available = models.PositiveIntegerField()
    unlisted = models.BooleanField(default=False)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, limit_choices_to=Q(subcategories=None)
    )
    created_by = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="ads"
    )
    images = models.JSONField(default=list)
    
    
    group = models.ForeignKey(AdGroup, on_delete=models.SET_NULL, related_name='ads', null=True, blank=True)
    specifications = models.JSONField(default=dict, validators=[BasicJsonValidator], blank=True)
    
    
    date_created = models.DateTimeField(auto_now_add=True)
    

    latest_push_date = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateTimeField(default=ad_default_expiry_date)
    highlight_expiry = models.DateTimeField(default=datetime.now)
    top_expiry = models.DateTimeField(default=datetime.now)
    gallery_expiry = models.DateTimeField(default=datetime.now)

    @property
    def push_expiry(self):
        return self.latest_push_date + timedelta(days=1)

    def is_highlight(self):
        return self.highlight_expiry > datetime.now()

    def is_top(self):
        return self.top_expiry > datetime.now()
    
    def is_gallery(self):
        return self.gallery_expiry > datetime.now()
    
    def can_highlight(self):
        return self.highlight_expiry < datetime.now()

    def can_top(self):
        return self.top_expiry < datetime.now()
    
    def can_gallery(self):
        return self.gallery_expiry < datetime.now()
    
    def can_push(self):
        return self.push_expiry < datetime.now()
    
    def apply_highlight(self):
        self.highlight_expiry = datetime.now() + timedelta(days=14)
        self.save()

    def apply_gallery(self):
        self.gallery_expiry = datetime.now() + timedelta(days=14)
        self.save()

    def apply_top(self):
        self.top_expiry = datetime.now() + timedelta(days=14)
        self.save()
        
    def apply_push(self):
        self.latest_push_date = datetime.now()
        self.save()

    def save(self, *args, **kwargs):
        if self.category.subcategories.all():
            raise ValidationError(
                "Category must be leaf category. Leaf category has no subcategories."
            )

        if len(self.images) == 0:
            raise ValidationError("Must attach at least one image.")

        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-date_created']


class AdBoost(models.Model):
    KINDS = (
        ('gallery', 'Gallery Boost'),
        ('top', 'Top Boost'),
        ('highlight', 'Highlight Boost'),
        ('push', 'Push')
    )

    AMOUNTS = {
        'push': 2.95,
        'highlight': 3.95,
        'top': 15.95,
        'gallery': 25.95
    }

    kind = models.CharField(max_length=50, choices=KINDS)
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, related_name="+", null=True)
    ad = models.ForeignKey(Ad, related_name='boosts', on_delete=models.SET_NULL, null=True)
    bank_account = models.ForeignKey(BankAccount, related_name='+', on_delete=models.SET_NULL, null=True)
    amount = models.FloatField()
    archive = models.JSONField(default=dict)

    def save(self, *args, **kwargs):
        creating = self._state.adding

        if not creating:
            raise IntegrityError("Cannot edit ad boost.")
        
        if self.bank_account.user != self.ad.created_by:
            raise PermissionDenied("Bank account must belong to ad creator.")
        
        if self.user != self.ad.created_by:
            raise PermissionDenied("Ad booster must be ad creator.")

        self.amount = self.AMOUNTS[self.kind]
        from users.serializers import BankAccountSerializer, AddressSerializer, PublicUserSerializer
        from .serializers import ArchiveAdModelSerializer
    
        self.archive = {
            'bank_account': BankAccountSerializer(self.bank_account).data,
            'user': PublicUserSerializer(self.user).data,
            'ad': ArchiveAdModelSerializer(self.ad).data,
        }

        super().save(*args, **kwargs)
        boost_method = getattr(self.ad, f"apply_{self.kind}")
        boost_method()

        from transactions.models import LedgerEntry

        LedgerEntry.objects.create(
            kind="ad_boost_transaction",
            signed_amount=self.amount,
            user=self.user,
            transaction_data={
                "subkind": self.kind,
                "pk": self.pk,
                **self.archive
            },
        )


class Cart(models.Model):
    KINDS = (
        ('visitor', 'Visitor Cart'),
        ('user', 'User Cart'),
    )

    kind = models.CharField(max_length=20, choices=KINDS)
    user = models.OneToOneField(CustomUser, related_name='cart', on_delete=models.CASCADE, null=True, blank=True)
    visitor = models.OneToOneField(Session, related_name='cart', on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self) -> str:
        if self.kind == 'visitor':
            return f'Visitor {self.visitor.pk}'
        else:
            return f'{self.user}'
    

class CartItem(models.Model):
    ad = models.ForeignKey(Ad, on_delete=models.CASCADE)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    amount = models.PositiveIntegerField()


class Order(models.Model):
    STATUS = (
        ('pending_payment', 'Pending Payment'),
        ('pending_shipping', 'Pending Shipping'),
        ('shipped', 'Shipped'),
        ('arrived', 'Arrived'),
        ('completed', 'Completed'),
        ('pending_return', 'Pending Return'),
        ('returned', 'Returned'),
        ('cancelled', 'Cancelled'),
    )
    buyer = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, related_name='orders', null=True)
    seller = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, related_name='sales', null=True)
    shipping_address = models.ForeignKey(Address, on_delete=models.SET_NULL, related_name='+', null=True)
    bank_account = models.ForeignKey(BankAccount, on_delete=models.SET_NULL, related_name='+', null=True)
    ad = models.ForeignKey(Ad, on_delete=models.SET_NULL, related_name='+', null=True)
    status = models.CharField(max_length=40, choices=STATUS)
    amount = models.PositiveIntegerField()
    archive = models.JSONField(default=dict)
    date_created = models.DateTimeField(auto_now_add=True)
    tracking_number = models.CharField(max_length=100, blank=True)

    @property
    def total(self):
        return self.amount * self.archive['ad']['price'] + self.archive['ad']['shipping']

    @property
    def return_date_expiry(self):
        return_policy = self.archive['ad']['return_policy']
        if return_policy == '7_days':
            return self.date_created + timedelta(days=7)
        elif return_policy == '30_days':
            return self.date_created + timedelta(days=30)

    def save(self, *args, **kwargs):
        creating = self._state.adding

        if creating:
            if self.buyer != self.shipping_address.user:
                raise IntegrityError("Buyer must be address user.")
            if self.buyer != self.bank_account.user :
                raise IntegrityError("Buyer must be bank account user.")
            if self.buyer == self.ad.created_by:
                raise IntegrityError("Buyer cannot be ad creator.")

            from users.serializers import BankAccountSerializer, AddressSerializer, PublicUserSerializer
            from .serializers import ArchiveAdModelSerializer
            self.archive = {
                'shipping_address': AddressSerializer(self.shipping_address).data,
                'bank_account': BankAccountSerializer(self.bank_account).data,
                'buyer': PublicUserSerializer(self.buyer).data,
                'seller':  PublicUserSerializer(self.seller).data,
                'ad': ArchiveAdModelSerializer(self.ad).data,
            }
            self.ad.available -= self.amount
            self.ad.save()
        
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-date_created']


class OrderCancellation(models.Model):
    order = models.OneToOneField(Order, related_name='cancellation', on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, related_name='+', on_delete=models.SET_NULL, null=True)
    user_archive = models.JSONField()
    reason = models.CharField(max_length=1028)

    def save(self, *args, **kwargs):
        creating = self._state.adding
        if not creating:
            raise IntegrityError("Cannot edit cancellations.")

        if self.user not in [self.order.seller, self.order.buyer]:
            raise IntegrityError("Order must be cancelled by order buyer or seller.")
        
        from users.serializers import PublicUserSerializer
        self.user_archive = PublicUserSerializer(self.user).data

        super().save(*args, **kwargs)