from django.contrib import admin

from .models import (
    Category,
    Ad,
    Cart,
    CartItem,
    Order,
    OrderItem
)


class AdAdmin(admin.ModelAdmin):
    list_display = ('pk', 'title', 'price', 'shipping', 'available', 'unlisted', 'created_by', 'date_created')
    list_filter = ('return_policy', 'condition', 'unlisted', 'category', 'created_by')
    search_fields = ['title']


admin.site.register(Category)
admin.site.register(Ad, AdAdmin)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Order)
admin.site.register(OrderItem)