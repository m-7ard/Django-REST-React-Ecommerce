from datetime import timedelta, datetime
import shutil
import json
import os

from rest_framework.test import APITestCase
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from django.core.files.storage import FileSystemStorage
from django.test import override_settings
from django.conf import settings

from users.models import CustomUser, FeeTransaction
from users.tests import TestUsersMixin, TestBankAccountsMixin
from .models import Ad, Category, AdGroup
from .serializers import AdModelSerializer


MEDIA_ROOT = settings.MEDIA_ROOT


class TestCategoryMixin:
    def setUp(self):
        self.base_category = Category.objects.create(name="Base Category")
        self.leaf_category = Category.objects.create(
            name="Leaf Category", parent=self.base_category
        )


class TestAdMixin(TestCategoryMixin):
    def setUp(self):
        TestCategoryMixin.setUp(self)
        self.test_user_ad = Ad.objects.create(
            title="Test User Ad",
            description="This is a test ad.",
            price=100,
            shipping=0,
            created_by=self.test_user,
            images=["image1.jpg", "image2.jpg"],
            category=self.leaf_category,
            available=1,
        )
        self.other_user_ad = Ad.objects.create(
            title="Other User Ad",
            description="This is a test ad.",
            price=99999,
            shipping=0,
            created_by=self.other_user,
            images=["image1.jpg", "image2.jpg"],
            category=self.leaf_category,
            available=1,
        )


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
            "shipping": 1.99,
            "created_by": self.user,
            "images": ["image1.jpg", "image2.jpg"],
            "available": 1,
        }

    def test_create_valid_category_ad(self):
        ad = Ad.objects.create(
            **self.ad_data, 
            category=self.leaf_category
        )
        self.assertEqual(ad.title, "Test Ad")
        self.assertEqual(ad.description, "This is a test ad.")
        self.assertEqual(ad.price, 100)
        self.assertEqual(ad.category, self.leaf_category)
        self.assertEqual(ad.created_by, self.user)
        self.assertEqual(ad.available, 1)
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


class AdViewSetTest(APITestCase, TestCategoryMixin, TestUsersMixin):
    def setUp(self):
        TestUsersMixin.setUp(self)
        TestCategoryMixin.setUp(self)
        self.client.login(
            email="test_user@mail.com",
            password="userword",
        )
        self.ad_data = {
            "title": "Test Ad",
            "description": "This is a test ad.",
            "price": 100,
            "shipping": 1.99,
            "available": 1,
            "return_policy": 'warranty',
            "images": json.dumps(["image1.jpg", "image2.jpg"]),
        }

    def test_api_valid_category_ad_create(self):
        response = self.client.post(
            "/api/ads/", data={
                **self.ad_data, 
                "category": self.leaf_category.pk
            }
        )
        self.assertEqual(response.status_code, 201, "Failed to create ad.")

    def test_api_invalid_category_ad_create(self):
        response = self.client.post(
            "/api/ads/", data={**self.ad_data, "category": self.base_category.pk}
        )
        self.assertEqual(
            response.status_code, 400, "Only leaf categories must be allowed."
        )


class ListUserAdsTest(APITestCase, TestBankAccountsMixin, TestAdMixin):
    def setUp(self):
        TestBankAccountsMixin.setUp(self)
        TestAdMixin.setUp(self)
        self.client.login(
            email="test_user@mail.com",
            password="userword",
        )

    def test_api_list_request_user_ads(self):
        response = self.client.get("/api/list_user_ads/")
        self.assertEqual(response.status_code, 200, "Failed to retrieve user ads.")
        serialized_ads = AdModelSerializer([self.test_user_ad], many=True).data
        self.assertEqual(response.data, serialized_ads, "Incorrect user ads data.")

    def test_api_list_user_ads_through_pk(self):
        response = self.client.get(f"/api/list_user_ads/{self.test_user_ad.pk}/")
        self.assertEqual(response.status_code, 200, "Failed to retrieve user ads.")
        serialized_ads = AdModelSerializer([self.test_user_ad], many=True).data
        self.assertEqual(response.data, serialized_ads, "Incorrect user ads data.")


class FrontpageApiViewTest(APITestCase, TestAdMixin, TestUsersMixin):
    def setUp(self):
        TestUsersMixin.setUp(self)
        TestAdMixin.setUp(self)
        self.test_user_ad.apply_highlight_boost()
        self.test_user_ad.refresh_from_db()

    def test_frontpage_api_view(self):
        response = self.client.get("/api/frontpage_data/")
        self.assertEqual(
            response.status_code, 200, "Failed to retrieve frontpage data."
        )

        self.assertIn(
            "HIGHLIGHT_ADS", response.data, "Missing 'HIGHLIGHT_ADS' key in response."
        )
        self.assertIn(
            "RECENT_ADS", response.data, "Missing 'RECENT_ADS' key in response."
        )

        highlight_ads_data = response.data["HIGHLIGHT_ADS"]
        self.assertEqual(
            len(highlight_ads_data), 1, "Unexpected number of highlight ads."
        )

        recent_ads_data = response.data["RECENT_ADS"]
        self.assertEqual(len(recent_ads_data), 2, "Unexpected number of recent ads.")


class AdImageFieldUploadViewTest(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            email="test_user@mail.com",
            password="userword",
            display_name="test_user",
            account_type="individual",
        )
        self.client.login(
            email="test_user@mail.com",
            password="userword",
        )
        self.storage = FileSystemStorage(MEDIA_ROOT)
        self.temp_files_route = MEDIA_ROOT + "\\tests\\temp_files\\"
        self.small_image = self.storage.open("tests/small_image.png")
        self.large_image = self.storage.open("tests/large_image.png")
        self.inavlid_file = self.storage.open("tests/invalid_file.txt")

    @override_settings(MEDIA_ROOT=(MEDIA_ROOT + "\\tests\\temp_files"))
    def test_valid_upload(self):
        response = self.client.post(
            "/api/validate_image/", {"image": [self.small_image]}
        )
        self.assertEqual(response.status_code, 200, "Failed to upload image.")
        self.assertIn(
            "fileName", response.data, "AdImageFieldUploadView did not return filename."
        )

        self.assertTrue(
            self.storage.exists(self.temp_files_route + response.data["fileName"]),
            "Valid files must be stored.",
        )

    @override_settings(MEDIA_ROOT=(MEDIA_ROOT + "\\tests\\temp_files"))
    def test_too_large_image(self):
        response = self.client.post(
            "/api/validate_image/", {"image": [self.large_image]}
        )
        self.assertEqual(
            response.status_code,
            413,
            "Images over 12mb must not be allowed to be uploaded.",
        )
        self.assertFalse(
            self.storage.exists(self.temp_files_route + os.path.basename(self.large_image.name))    
        )

    @override_settings(MEDIA_ROOT=(MEDIA_ROOT + "\\tests\\temp_files"))
    def test_invalid_format_file(self):
        response = self.client.post(
            "/api/validate_image/", {"image": [self.inavlid_file]}
        )
        self.assertEqual(
            response.status_code,
            415,
            "Invalid file formats must not be allowed to be uploaded.",
        )
        self.assertFalse(
            self.storage.exists(self.temp_files_route + os.path.basename(self.inavlid_file.name))    
        )

    def tearDown(self):
        try:
            shutil.rmtree(self.temp_files_route)
        except OSError:
            pass


class AdBoostTest(APITestCase, TestBankAccountsMixin, TestAdMixin):
    def setUp(self):
        TestBankAccountsMixin.setUp(self)
        TestAdMixin.setUp(self)
        self.client.login(**self.test_user_login_credentials)
        self.test_user.funds = 1000
        self.test_user.save()

    def test_valid_boost(self):
        old_latest_push_date = self.test_user_ad.latest_push_date
        old_highlight_expiry = self.test_user_ad.highlight_expiry
        old_top_expiry = self.test_user_ad.top_expiry
        old_gallery_expiry = self.test_user_ad.gallery_expiry

        response = self.client.post(
            f"/api/ads/{self.test_user_ad.pk}/boost/",
            {
                "boosts": ["highlight_ad", "top_ad", "gallery_ad", "push_ad"],
                "payer_bank_account": self.test_user_bank.pk,
            },
        )

        self.assertEqual(
            response.status_code,
            200,
            f"Failed to perform a valid ad boost. {response.data}",
        )

        self.test_user_ad.refresh_from_db()
        self.assertGreater(self.test_user_ad.latest_push_date, old_latest_push_date)
        self.assertGreater(self.test_user_ad.highlight_expiry, old_highlight_expiry)
        self.assertGreater(self.test_user_ad.top_expiry, old_top_expiry)
        self.assertGreater(self.test_user_ad.gallery_expiry, old_gallery_expiry)
        all_fee_transactions = FeeTransaction.objects.all()
        self.assertEqual(
            len(all_fee_transactions), 4, "Valid boosts must create fee transaction"
        )

    def test_invalid_kind_boost(self):
        response = self.client.post(
            f"/api/ads/{self.test_user_ad.pk}/boost/",
            {
                "boosts": ["highlight_ad", "something_invalid"],
                "payer_bank_account": self.test_user_bank.pk,
            },
        )

        self.assertEqual(response.status_code, 400, "Invalid boosts must fail.")

    def test_invalid_already_boosted(self):
        self.test_user_ad.apply_gallery_boost()
        self.test_user_ad.refresh_from_db()
        old_gallery_expiry = self.test_user_ad.gallery_expiry

        response = self.client.post(
            f"/api/ads/{self.test_user_ad.pk}/boost/",
            {
                "boosts": ["gallery_ad", "push_ad"],
                "payer_bank_account": self.test_user_bank.pk,
            },
        )

        self.assertEqual(response.status_code, 400, "Invalid boosts must fail.")
        self.test_user_ad.refresh_from_db()
        self.assertEqual(
            self.test_user_ad.gallery_expiry,
            old_gallery_expiry,
            "Failed boosts must not apply the effect.",
        )

    def test_invalid_user_bank(self):
        """

        Note: we are logged in as test_user

        """
        old_gallery_expiry = self.other_user_ad.gallery_expiry

        response = self.client.post(
            f"/api/ads/{self.other_user_ad.pk}/boost/",
            {
                "boosts": ["gallery_ad", "push_ad"],
                "payer_bank_account": self.other_user_bank.pk,
            },
        )

        self.assertEqual(response.status_code, 404, "Invalid boosts must fail.")
        self.other_user_ad.refresh_from_db()
        self.assertEqual(
            self.other_user_ad.gallery_expiry,
            old_gallery_expiry,
            "Failed boosts must not apply the effect.",
        )


class AdSearchTest(APITestCase, TestUsersMixin):
    def setUp(self):
        TestUsersMixin.setUp(self)
        self.base_category = Category.objects.create(name="All Categories")
        self.cooking_category = Category.objects.create(
            name="Cooking", parent=self.base_category
        )
        self.electronics_category = Category.objects.create(
            name="Electronics", parent=self.base_category
        )
        self.books_category = Category.objects.create(
            name="Books", parent=self.base_category
        )

        self.cooking_pan_ad = Ad.objects.create(
            title="Cooking Pan",
            price=50,
            shipping=1.99,
            category=self.cooking_category,
            created_by=self.test_user,
            available=1,
            images=['image.jpg']
        )
        self.phone_ad = Ad.objects.create(
            title="Phone XI 0 Model",
            price=1000,
            shipping=1.99,
            category=self.electronics_category,
            created_by=self.test_user,
            available=1,
            images=['image.jpg']
        )
        self.model_building_book_ad = Ad.objects.create(
            title="Ship Model Building with Illustrated Examples. XI edition",
            price=20,
            shipping=1.99,
            category=self.books_category,
            created_by=self.test_user,
            available=1,
            images=['image.jpg']
        )

    def test_empty_search(self):
        response = self.client.get("/api/ads/search/")
        self.assertEqual(response.status_code, 200, "Failed to search for ads.")
        self.assertEqual(
            response.data['results'],
            AdModelSerializer(Ad.objects.all(), many=True).data,
            "Empty search must return all ads.",
        )

    def test_title_search(self):
        response = self.client.get("/api/ads/search/?q=model")
        self.assertEqual(
            len(response.data['results']),
            2,
            "Check that there are 2 ads with 'model' in their titles",
        )

    def test_price_search(self):
        response_1 = self.client.get("/api/ads/search/?min_price=0&max_price=50")
        self.assertEqual(
            len(response_1.data['results']),
            2,
            "Check that there are 2 ads with price equal or smaller than 50.",
        )
        response_2 = self.client.get("/api/ads/search/?min_price=50&max_price=0")
        self.assertEqual(
            response_2.data['results'],
            response_1.data['results'],
            "If min price is bigger than the max price, it should flip the values.",
        )
