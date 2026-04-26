# lessons/admin.py
from django.contrib import admin
from .models import LessonEntry

@admin.register(LessonEntry)
class LessonEntryAdmin(admin.ModelAdmin):
    list_display  = ('student', 'date', 'grade', 'graded_by', 'file_name')
    list_filter   = ('grade',)
    search_fields = ('student__email', 'comment')
    readonly_fields = ('file_url', 'file_name', 'created_at', 'updated_at')
