# Generated by Django 4.2.6 on 2023-12-26 14:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0009_address_name'),
    ]

    operations = [
        migrations.RenameField(
            model_name='customuser',
            old_name='default_deliver_address',
            new_name='default_address',
        ),
    ]
