# Generated by Django 4.2.6 on 2024-01-11 14:15

import datetime
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import store.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('sessions', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Ad',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=64)),
                ('description', models.CharField(blank=True, max_length=4096)),
                ('price', models.PositiveIntegerField()),
                ('shipping', models.PositiveIntegerField()),
                ('return_policy', models.CharField(choices=[('7_days', '7 Days Return Policy'), ('30_days', '30 Days Return Policy'), ('warranty', 'Warranty Period Policy')], max_length=30)),
                ('condition', models.CharField(blank=True, choices=[('new', 'New'), ('almost_new', 'Almost New'), ('used', 'Used'), ('damaged', 'Damaged')], max_length=30)),
                ('available', models.PositiveIntegerField()),
                ('unlisted', models.BooleanField(default=False)),
                ('images', models.JSONField(default=list)),
                ('date_created', models.DateTimeField(auto_now_add=True)),
                ('latest_push_date', models.DateTimeField(auto_now_add=True)),
                ('expiry_date', models.DateTimeField(default=store.models.ad_default_expiry_date)),
                ('highlight_expiry', models.DateTimeField(default=datetime.datetime.now)),
                ('top_expiry', models.DateTimeField(default=datetime.datetime.now)),
                ('gallery_expiry', models.DateTimeField(default=datetime.datetime.now)),
            ],
        ),
        migrations.CreateModel(
            name='Cart',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('kind', models.CharField(choices=[('visitor', 'Visitor Cart'), ('user', 'User Cart')], max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=30, unique=True)),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='subcategories', to='store.category')),
            ],
        ),
        migrations.CreateModel(
            name='CartItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.PositiveIntegerField(default=1)),
                ('ad', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='store.ad')),
                ('cart', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='store.cart')),
            ],
        ),
        migrations.AddField(
            model_name='cart',
            name='ads',
            field=models.ManyToManyField(related_name='in_carts', through='store.CartItem', to='store.ad'),
        ),
        migrations.AddField(
            model_name='cart',
            name='user',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='cart', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='cart',
            name='visitor',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='cart', to='sessions.session'),
        ),
        migrations.AddField(
            model_name='ad',
            name='category',
            field=models.ForeignKey(limit_choices_to=models.Q(('subcategories', None)), on_delete=django.db.models.deletion.CASCADE, to='store.category'),
        ),
        migrations.AddField(
            model_name='ad',
            name='created_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='ads', to=settings.AUTH_USER_MODEL),
        ),
    ]
