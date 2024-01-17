import random

from django.core.management.base import BaseCommand, CommandError, CommandParser

from users.models import CustomUser, BankAccount, Address
from store.models import Ad, Category


class Command(BaseCommand):
    def handle(self, *args, **options):
        leaf_categories = Category.objects.filter(subcategories=None)
        for i in range(0, 50):
            for j, user in enumerate(CustomUser.objects.all()):
                category = random.choice(leaf_categories)
                images = [
                    'stock/excavator1.jpg', 
                    'stock/excavator2.jpg', 
                    'stock/fish1.jpg', 
                    'stock/fish2.jpg', 
                    'stock/tea1.jpg',
                    'stock/tea2.jpg',
                    'stock/tea3.jpg',
                    'stock/tea4.jpg',
                    'stock/truck1.jpg',
                    'stock/truck2.jpg',
                    'stock/truck3.jpg',
                    'stock/truck4.jpg',
                ]
                random.shuffle(images)
                Ad.objects.create(
                    created_by=user,
                    category=category,
                    title=f"{user.display_name} {category.name} Ad #{i * (j + 1)}",
                    return_policy=random.choice(Ad.RETURN_POLICIES)[0],
                    condition=random.choice(Ad.CONDITIONS)[0],
                    available=random.randint(1, 100),
                    price=random.randint(1, 100),
                    shipping=random.randint(0, 15),
                    images=images
                )
