from datetime import datetime, timedelta

from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.query import Q

from users.models import CustomUser


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


class Ad(models.Model):
    title = models.CharField(max_length=64)
    description = models.CharField(max_length=4096, blank=True)
    price = models.PositiveIntegerField()
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, limit_choices_to=Q(subcategories=None)
    )
    created_by = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="ads", null=True
    )
    images = models.JSONField(default=list)

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

        super().save(*args, **kwargs)
