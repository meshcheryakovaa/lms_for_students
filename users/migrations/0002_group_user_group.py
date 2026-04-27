import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Group',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, unique=True, verbose_name='Название группы')),
                ('year', models.PositiveSmallIntegerField(verbose_name='Год набора')),
                ('is_archived', models.BooleanField(default=False, verbose_name='Архивная')),
                ('curator', models.ForeignKey(
                    blank=True,
                    limit_choices_to={'role': 'teacher'},
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='curated_groups',
                    to=settings.AUTH_USER_MODEL,
                    verbose_name='Куратор',
                )),
            ],
            options={
                'verbose_name': 'Группа',
                'verbose_name_plural': 'Группы',
                'ordering': ['name'],
            },
        ),
        migrations.AddField(
            model_name='user',
            name='group',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='students',
                to='users.group',
                verbose_name='Группа',
            ),
        ),
    ]
