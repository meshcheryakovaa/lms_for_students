# lessons/models.py
from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

User = settings.AUTH_USER_MODEL


class LessonEntry(models.Model):
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='entries',
        verbose_name='Студент',
    )
    date = models.DateField(verbose_name='Дата занятия')
    comment = models.TextField(verbose_name='Что делал на занятии')

    # Яндекс Диск — вместо FileField
    file_name = models.CharField(max_length=255, blank=True, verbose_name='Имя файла')
    file_url = models.URLField(max_length=2048, blank=True, verbose_name='Ссылка (Я.Диск)')

    # Оценка — ставит учитель
    grade = models.PositiveSmallIntegerField(
        blank=True, null=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Оценка',
    )
    graded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='graded_entries',
        verbose_name='Выставил оценку',
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Запись о занятии'
        verbose_name_plural = 'Записи о занятиях'

    def __str__(self):
        return f'{self.student} · {self.date}'
