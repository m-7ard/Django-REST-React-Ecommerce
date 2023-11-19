# Generated by Django 4.2.6 on 2023-11-16 16:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0003_ad_created_by_ad_date_created'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ad',
            name='description',
            field=models.CharField(blank=True, max_length=4096),
        ),
        migrations.AlterField(
            model_name='ad',
            name='price',
            field=models.PositiveIntegerField(),
        ),
    ]
