# Generated by Django 4.2.6 on 2023-12-29 21:30

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0017_remove_transaction_visible_to_users_by_pk_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='banktransaction',
            old_name='bank_account',
            new_name='source_bank_account',
        ),
        migrations.RenameField(
            model_name='feetransaction',
            old_name='bank_account',
            new_name='source_bank_account',
        ),
        migrations.AddField(
            model_name='paymenttransaction',
            name='source_bank_account',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to='users.bankaccount'),
        ),
        migrations.AlterField(
            model_name='paymenttransaction',
            name='receiver',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='received_payments', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='paymenttransaction',
            name='sender',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='sent_payments', to=settings.AUTH_USER_MODEL),
        ),
    ]
