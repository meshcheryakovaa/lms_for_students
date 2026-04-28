from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Group, User


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display  = ('name', 'year', 'curator', 'is_archived')
    list_filter   = ('is_archived', 'year')
    search_fields = ('name',)
    ordering      = ('name',)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display  = ('email', 'get_full_name', 'role', 'group', 'is_active')
    list_filter   = ('role', 'group')
    search_fields = ('email', 'first_name', 'last_name')
    ordering      = ('email',)
