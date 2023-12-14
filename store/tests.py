from rest_framework.test import APITestCase
from django.db import IntegrityError
from django.core.exceptions import ValidationError

from users.models import CustomUser
from .models import Ad, Category


class AdModelTest(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            email="test_user@mail.com",
            password="userword",
            display_name="test_user",
            account_type="individual",
        )
        self.base_category = Category.objects.create(name="All Categories", parent=None)
        self.leaf_category = Category.objects.create(
            name="Category 1", parent=self.base_category
        )
        self.ad_data = {
            "title": "Test Ad",
            "description": "This is a test ad.",
            "price": 100,
            "created_by": self.user,
            "images": ["image1.jpg", "image2.jpg"],
        }

    def test_create_valid_category_ad(self):
        ad = Ad.objects.create(**self.ad_data, category=self.leaf_category)
        self.assertEqual(ad.title, "Test Ad")
        self.assertEqual(ad.description, "This is a test ad.")
        self.assertEqual(ad.price, 100)
        self.assertEqual(ad.category, self.leaf_category)
        self.assertEqual(ad.created_by, self.user)
        self.assertEqual(ad.images, ["image1.jpg", "image2.jpg"])
        self.assertFalse(ad.is_highlight())

    def test_create_invalid_category_ad(self):
        self.assertRaises(
            ValidationError,
            Ad.objects.create,
            **self.ad_data,
            category=self.base_category,
        )


class CategoryModelTest(APITestCase):
    def setUp(self):
        self.base_category = Category.objects.create(name="Base Category", parent=None)

    def test_base_category_creation(self):
        self.assertEqual(
            self.base_category.parent, None, "Base Category must not have a parent."
        )

    def test_subcategory_creation(self):
        subcategory = Category.objects.create(
            name="Sub Category", parent=self.base_category
        )
        self.assertIsNotNone(subcategory.parent, "Subcategory must have a parent.")

    def test_category_str_method(self):
        subcategory = Category.objects.create(
            name="Sub Category", parent=self.base_category
        )
        self.assertEqual(str(self.base_category), self.base_category.name)
        expected_str = f"{self.base_category.name} > {subcategory.name}"
        self.assertEqual(str(subcategory), expected_str)

    def test_subcategories_attribute(self):
        subcategory_1 = Category.objects.create(
            name="Subcategory 1", parent=self.base_category
        )
        subcategory_2 = Category.objects.create(
            name="Subcategory 2", parent=self.base_category
        )

        subcategories = self.base_category.subcategories.all()
        self.assertEqual(subcategories.count(), 2)
        self.assertIn(subcategory_1, subcategories)
        self.assertIn(subcategory_2, subcategories)

    def test_unique_name(self):
        self.assertRaises(
            IntegrityError,
            Category.objects.create,
            name="Base Category",
            parent=self.base_category,
        )

    def test_unique_base_category(self):
        self.assertRaises(
            ValidationError,
            Category.objects.create,
            name="subcategory",
            parent=None,
        )


class AdViewSetTest(APITestCase):
    pass