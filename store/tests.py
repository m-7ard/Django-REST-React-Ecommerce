from datetime import timedelta, datetime
import shutil

from rest_framework.test import APITestCase
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from django.core.files.storage import FileSystemStorage
from django.test import override_settings
from django.conf import settings

from users.models import CustomUser
from .models import Ad, Category
from .serializers import AdModelSerializer


MEDIA_ROOT = settings.MEDIA_ROOT


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
        self.base_category = Category.objects.create(name="All Categories", parent=None)
        self.leaf_category = Category.objects.create(
            name="Category 1", parent=self.base_category
        )
        self.ad_data = {
            "title": "Test Ad",
            "description": "This is a test ad.",
            "price": 100,
            "images": ["image1.jpg", "image2.jpg"],
        }

    def test_api_valid_category_ad_create(self):
        response = self.client.post(
            "/api/ads/", data={**self.ad_data, "category": self.leaf_category.pk}
        )
        self.assertEqual(response.status_code, 201, "Failed to create ad.")

    def test_api_invalid_category_ad_create(self):
        response = self.client.post(
            "/api/ads/", data={**self.ad_data, "category": self.base_category.pk}
        )
        self.assertEqual(
            response.status_code, 400, "Only leaf categories must be allowed."
        )


class ListUserAdsTest(APITestCase):
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
        self.base_category = Category.objects.create(name="All Categories", parent=None)
        self.leaf_category = Category.objects.create(
            name="Category 1", parent=self.base_category
        )
        self.ad_data = {
            "title": "Test Ad",
            "description": "This is a test ad.",
            "price": 100,
            "images": ["image1.jpg", "image2.jpg"],
        }

    def test_api_list_request_user_ads(self):
        ad1 = Ad.objects.create(
            title="Ad 1",
            description="Description 1",
            price=50,
            created_by=self.user,
            category=self.leaf_category,
        )
        ad2 = Ad.objects.create(
            title="Ad 2",
            description="Description 2",
            price=75,
            created_by=self.user,
            category=self.leaf_category,
        )
        response = self.client.get("/api/list_user_ads/")
        self.assertEqual(response.status_code, 200, "Failed to retrieve user ads.")
        serialized_ads = AdModelSerializer([ad1, ad2], many=True).data
        self.assertEqual(response.data, serialized_ads, "Incorrect user ads data.")

    def test_api_list_user_ads_through_pk(self):
        ad1 = Ad.objects.create(
            title="Ad 1",
            description="Description 1",
            price=50,
            created_by=self.user,
            category=self.leaf_category,
        )
        ad2 = Ad.objects.create(
            title="Ad 2",
            description="Description 2",
            price=75,
            created_by=self.user,
            category=self.leaf_category,
        )
        response = self.client.get(f"/api/list_user_ads/{self.user.pk}/")
        self.assertEqual(response.status_code, 200, "Failed to retrieve user ads.")
        serialized_ads = AdModelSerializer([ad1, ad2], many=True).data
        self.assertEqual(response.data, serialized_ads, "Incorrect user ads data.")


class FrontpageApiViewTest(APITestCase):
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
        self.highlight_ad_1 = Ad.objects.create(
            title="Highlight Ad 1",
            description="Description 1",
            price=50,
            created_by=self.user,
            category=self.leaf_category,
            highlight_expiry=datetime.now() + timedelta(days=30),
        )
        self.highlight_ad_2 = Ad.objects.create(
            title="Highlight Ad 2",
            description="Description 2",
            price=50,
            created_by=self.user,
            category=self.leaf_category,
            highlight_expiry=datetime.now() + timedelta(days=30),
        )

        self.normal_ad_1 = Ad.objects.create(
            title=f"Normal Ad 1",
            description=f"Description 1",
            price=50,
            created_by=self.user,
            category=self.leaf_category,
        )
        self.normal_ad_2 = Ad.objects.create(
            title=f"Normal Ad 2",
            description=f"Description 2",
            price=50,
            created_by=self.user,
            category=self.leaf_category,
        )        

    def test_frontpage_api_view(self):
        response = self.client.get('/api/frontpage_data/')
        self.assertEqual(response.status_code, 200, "Failed to retrieve frontpage data.")

        self.assertIn("HIGHLIGHT_ADS", response.data, "Missing 'HIGHLIGHT_ADS' key in response.")
        self.assertIn("RECENT_ADS", response.data, "Missing 'RECENT_ADS' key in response.")

        highlight_ads_data = response.data["HIGHLIGHT_ADS"]
        self.assertEqual(len(highlight_ads_data), 2, "Unexpected number of highlight ads.")

        recent_ads_data = response.data["RECENT_ADS"]
        self.assertEqual(len(recent_ads_data), 4, "Unexpected number of recent ads.")

    
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
        self.small_image = self.storage.open('tests/small_image.png')
        self.large_image = self.storage.open('tests/large_image.png')
        self.inavlid_file = self.storage.open('tests/invalid_file.txt')

    @override_settings(MEDIA_ROOT=(MEDIA_ROOT + '\\tests\\temp_files'))
    def test_valid_upload(self):
        response = self.client.post('/api/validate_image/', {"image": [self.small_image]})
        self.assertEqual(response.status_code, 200, "Failed to upload image.")
        self.assertIn('fileName', response.data, "AdImageFieldUploadView did not return filename.")
        self.assertTrue(self.storage.exists(response.data['fileName']), "Valid files must be stored.")

    @override_settings(MEDIA_ROOT=(MEDIA_ROOT + '\\tests\\temp_files'))
    def test_too_large_image(self):
        response = self.client.post('/api/validate_image/', {"image": [self.large_image]})
        self.assertEqual(response.status_code, 413, "Images over 12mb must not be allowed to be uploaded.")
    
    @override_settings(MEDIA_ROOT=(MEDIA_ROOT + '\\tests\\temp_files'))
    def test_invalid_format_file(self):
        response = self.client.post('/api/validate_image/', {"image": [self.inavlid_file]})
        self.assertEqual(response.status_code, 415, "Invalid file formats must not be allowed to be uploaded.")

    def tearDown(self):
        try:
            shutil.rmtree(MEDIA_ROOT + '\\tests\\temp_files')
        except OSError:
            pass