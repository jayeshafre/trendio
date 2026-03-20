from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model       = OrderItem
    extra       = 0
    readonly_fields = ('product_name', 'product_price', 'quantity', 'subtotal')
    can_delete  = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display   = ('order_number', 'user', 'status', 'grand_total', 'city', 'created_at')
    list_filter    = ('status',)
    search_fields  = ('order_number', 'user__email', 'phone')
    readonly_fields = ('order_number', 'total_amount', 'delivery_charge', 'created_at')
    list_editable  = ('status',)
    inlines        = [OrderItemInline]

    fieldsets = (
        ('Order Info',    {'fields': ('order_number', 'user', 'status')}),
        ('Amount',        {'fields': ('total_amount', 'delivery_charge')}),
        ('Delivery',      {'fields': ('full_name', 'phone', 'address_line1', 'address_line2', 'city', 'state', 'pincode', 'notes')}),
        ('Timestamps',    {'fields': ('created_at',)}),
    )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product_name', 'quantity', 'product_price', 'subtotal')