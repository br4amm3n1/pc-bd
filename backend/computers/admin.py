from django.contrib import admin
from .models import Computer, Changes


@admin.register(Computer)
class ComputerAdmin(admin.ModelAdmin):
    list_display = (
        'computer_name',
        'pc_owner',
        'pc_owner_position_at_work',
        'ip_address',
        'location_address',
        'floor',
        'office',
        'operating_system',
        'has_kaspersky',
        'created_at',
    )
    list_filter = (
        'operating_system',
        'has_kaspersky',
        'floor',
        'domain'
    )
    search_fields = (
        'computer_name',
        'ip_address',
        'location_address',
        'office'
    )
    readonly_fields = (
        'created_at',
        'updated_at'
    )
    fieldsets = (
        ('Основная информация', {
            'fields': (
                'computer_name',
                'ip_address',
                'domain',
                'operating_system',
                'has_kaspersky',
                'comment',
            )
        }),
        ('Расположение', {
            'fields': (
                'location_address',
                'floor',
                'office'
            )
        }),
        ('Даты', {
            'fields': (
                'created_at',
                'updated_at'
            ),
            'classes': ('collapse',)
        }),
    )
    ordering = ('computer_name',)


class ChangesInline(admin.TabularInline):
    model = Changes
    extra = 0
    readonly_fields = (
        'user',
        'change_date'
    )
    fields = (
        'change_description',
        'user',
        'change_date'
    )

    def has_add_permission(self, request, obj):
        return False


@admin.register(Changes)
class ChangesAdmin(admin.ModelAdmin):
    list_display = (
        'computer',
        'user',
        'change_description_short',
        'change_date'
    )
    list_filter = (
        'change_date',
        'computer__computer_name'
    )
    search_fields = (
        'computer__computer_name',
        'user__username',
        'change_description'
    )
    readonly_fields = (
        'computer',
        'user',
        'change_date'
    )
    date_hierarchy = 'change_date'
    ordering = ('-change_date',)

    def change_description_short(self, obj):
        return obj.change_description[:50] + '...' if len(obj.change_description) > 50 else obj.change_description
    change_description_short.short_description = 'Описание изменения'

    def save_model(self, request, obj, form, change):
        if not obj.user_id:
            obj.user = request.user
        super().save_model(request, obj, form, change)