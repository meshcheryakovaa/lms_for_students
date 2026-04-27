from django.contrib.auth.models import AbstractUser
from django.db import models


class Group(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name='Название группы')
    year = models.PositiveSmallIntegerField(verbose_name='Год набора')
    curator = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='curated_groups',
        verbose_name='Куратор',
        limit_choices_to={'role': 'teacher'},
    )
    is_archived = models.BooleanField(default=False, verbose_name='Архивная')

    class Meta:
        ordering = ['name']
        verbose_name = 'Группа'
        verbose_name_plural = 'Группы'

    def __str__(self):
        return self.name


class User(AbstractUser):
    STUDENT = 'student'
    TEACHER = 'teacher'
    ROLE_CHOICES = [(STUDENT, 'Студент'), (TEACHER, 'Преподаватель')]

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=STUDENT)
    group = models.ForeignKey(
        Group,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='students',
        verbose_name='Группа',
    )

    groups = models.ManyToManyField(
        'auth.Group', related_name='lms_users', blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission', related_name='lms_users', blank=True
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
