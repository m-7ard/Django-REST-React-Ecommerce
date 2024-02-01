from django import forms
from .models import CartItem, Ad


class CartAdForm(forms.Form):
    price = forms.FloatField(min_value=0)
    title = forms.CharField(min_length=1)
    unlisted = forms.BooleanField(required=False)
    shipping = forms.FloatField(min_value=0)
    condition = forms.ChoiceField(choices=Ad.CONDITIONS)

    def clean(self):
        cleaned_data = super().clean()
        ad = Ad.objects.get(pk=self.data['pk'])
        
        errors = []
        
        for field, value in cleaned_data.items():
            db_value = getattr(ad, field)
            if db_value != value:
                errors.append((field, f'{field} changed from {value} to {db_value}'))

        for field, message in errors:
            self.add_error(field, message)

    class Meta:
        fields = [
            "price",
            "title",
            "unlisted",
            "shipping",
            "condition",
        ]
        

class ItemForm(forms.Form):
    amount = forms.IntegerField(min_value=1)
    ad = forms.JSONField()

    def clean(self):
        cleaned_data = super().clean()
        amount = cleaned_data.get('amount')

        item = CartItem.objects.get(pk=self.data['pk'])
        if amount and amount > item.ad.available:
            self.add_error('amount', f'Amount cannot be larger than available.')
        
        cart_ad_form = CartAdForm(self.data["ad"])
        if not cart_ad_form.is_valid():
            for field, message in cart_ad_form.errors.items():
                self.add_error('ad', message)


