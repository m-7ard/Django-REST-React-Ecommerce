# Generated by Django 4.2.6 on 2024-01-18 16:31

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0021_remove_feetransaction_action_bank_account_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='banktransaction',
            name='kind',
        ),
        migrations.RemoveField(
            model_name='feetransaction',
            name='payer',
        ),
        migrations.RemoveField(
            model_name='paymenttransaction',
            name='receiver',
        ),
        migrations.RemoveField(
            model_name='paymenttransaction',
            name='sender',
        ),
        migrations.AddField(
            model_name='feetransaction',
            name='payer_bank_account',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to='users.bankaccount'),
        ),
        migrations.AddField(
            model_name='paymenttransaction',
            name='receiver_bank_account',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='received_payments', to='users.bankaccount'),
        ),
        migrations.AddField(
            model_name='paymenttransaction',
            name='sender_bank_account',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='sent_payments', to='users.bankaccount'),
        ),
        migrations.AlterField(
            model_name='banktransaction',
            name='transaction',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='withdrawal', to='users.transaction'),
        ),
        migrations.AlterField(
            model_name='transaction',
            name='kind',
            field=models.CharField(choices=[('withdrawal', 'Withdrawal Transaction'), ('payment_transaction', 'Payment Transaction'), ('fee_transaction', 'Fee Transaction')], max_length=20),
        ),
    ]