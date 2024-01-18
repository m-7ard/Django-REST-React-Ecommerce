# Generated by Django 4.2.6 on 2024-01-02 23:22

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0020_remove_banktransaction_date_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='feetransaction',
            name='action_bank_account',
        ),
        migrations.RemoveField(
            model_name='paymenttransaction',
            name='action_bank_account',
        ),
        migrations.AddField(
            model_name='feetransaction',
            name='payer',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='feetransaction',
            name='kind',
            field=models.CharField(choices=[('push_ad', 'Push Ad'), ('highlight_ad', 'Highlight Ad'), ('top_ad', 'Top Ad'), ('gallery_ad', 'Gallery Ad')], max_length=30),
        ),
    ]