from django.contrib import admin
from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ('name', 'slug', 'is_active', 'created_at')
    list_filter   = ('is_active',)
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display  = ('name', 'category', 'price', 'stock', 'is_active', 'is_featured')
    list_filter   = ('is_active', 'is_featured', 'category')
    search_fields = ('name', 'sku')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('is_active', 'is_featured', 'stock')