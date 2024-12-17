from django.core.management.base import BaseCommand, CommandError, CommandParser

from users.models import CustomUser, BankAccount, Address
from store.models import Ad, Category


def create_categories(categories: dict, parent=None):
    for label, subcategories in categories.items():
        category = Category.objects.create(name=label, parent=parent)
        if subcategories:
            create_categories(subcategories, category)



class Command(BaseCommand):
    def handle(self, *args, **options):
        for i in range(0, 5):
            CustomUser.objects.create_user(
                display_name=f"user{i}",
                email=f"user{i}@mail.com",
                password="userword",
                account_type="individual",
            )

        create_categories(category_data)


category_data = {
    "All Categories": {
        "Electronics": {
            "Smartphones": {},
            "Laptops": {},
            "Headphones": {},
            "Cameras": {},
        },
        "Clothing": {
            "Men's Clothing": {"T-Shirts": {}, "Jeans": {}},
            "Women's Clothing": {"Dresses": {}, "Tops": {}},
        },
        "Home & Kitchen": {
            "Furniture": {"Sofas": {}, "Tables": {}},
            "Appliances": {"Refrigerators": {}, "Microwaves": {}},
        },
        "Sports & Outdoors": {
            "Exercise Equipment": {"Treadmills": {}, "Weights": {}},
            "Outdoor Gear": {"Camping Equipment": {}, "Hiking Gear": {}},
        },
        "Beauty & Personal Care": {
            "Skincare": {"Moisturizers": {}, "Cleansers": {}},
            "Hair Care": {"Shampoos": {}, "Conditioners": {}},
        },
        "Toys & Games": {
            "Board Games": {"Strategy Games": {}, "Family Games": {}},
            "Action Figures": {"Superheroes": {}, "Movie Characters": {}},
        },
        "Books & Audible": {
            "Fiction": {"Mystery": {}, "Science Fiction": {}},
            "Non-Fiction": {"Biographies": {}, "Self-Help": {}},
        },
        "Automotive": {
            "Car Accessories": {"Car Chargers": {}, "Seat Covers": {}},
            "Tools & Equipment": {"Tool Sets": {}, "Air Compressors": {}},
        },
    }
}
