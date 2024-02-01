from datetime import datetime, timedelta
from collections import defaultdict

from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.query import Q
from django.contrib.sessions.models import Session
from django.core.validators import MinValueValidator

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
    price = models.FloatField(validators=[MinValueValidator(0)])
    shipping = models.FloatField(validators=[MinValueValidator(0)])
    return_policy = models.CharField(max_length=30, choices=RETURN_POLICIES)
    condition = models.CharField(max_length=30, choices=CONDITIONS, blank=True)
    available = models.PositiveIntegerField()
    unlisted = models.BooleanField(default=False)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, limit_choices_to=Q(subcategories=None)
    )
    created_by = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="ads", null=True
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

    def is_highlight(self):
        return self.highlight_expiry > datetime.now()

    def is_top(self):
        return self.top_expiry > datetime.now()
    
    def is_gallery(self):
        return self.gallery_expiry > datetime.now()
    
    def apply_highlight_boost(self):
        self.highlight_expiry = datetime.now() + timedelta(days=14)
        self.save()

    def apply_gallery_boost(self):
        self.gallery_expiry = datetime.now() + timedelta(days=14)
        self.save()

    def apply_top_boost(self):
        self.top_expiry = datetime.now() + timedelta(days=14)
        self.save()
        
    def apply_push_boost(self):
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
        ('canceled', 'Canceled'),
    )
    buyer = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, related_name='orders', null=True)
    shipping_address = models.ForeignKey(Address, on_delete=models.SET_NULL, related_name='+', null=True)
    bank_account = models.ForeignKey(BankAccount, on_delete=models.SET_NULL, related_name='+', null=True)
    status = models.CharField(max_length=40, choices=STATUS)
    archive = models.JSONField(default=dict)

    @property
    def total(self):
        return sum([
            item.amount * item.ad_archive['price'] + item.ad_archive['shipping']
            for item in self.items.all()
        ])

    def save(self, *args, **kwargs):
        creating = self._state.adding

        if creating:
            from users.serializers import BankAccountSerializer, AddressSerializer, PublicUserSerializer
            self.archive = {
                'shipping_address': AddressSerializer(self.shipping_address).data,
                'bank_account': BankAccountSerializer(self.bank_account).data,
                'buyer': PublicUserSerializer(self.buyer).data
            }
        
        super().save()


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    ad = models.ForeignKey(Ad, on_delete=models.SET_NULL, related_name='+', null=True)
    amount = models.PositiveIntegerField()
    ad_archive = models.JSONField(default=dict)

    def save(self, *args, **kwargs):
        creating = self._state.adding

        if creating:
            from .serializers import ArchiveAdModelSerializer
            self.ad_archive = ArchiveAdModelSerializer(self.ad).data
            self.ad.available -= self.amount
            self.ad.save()
        
        super().save()

