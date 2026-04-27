import django_filters

from lessons.models import LessonEntry


class LessonEntryFilter(django_filters.FilterSet):
    # ?graded=true  → записи с оценкой
    # ?graded=false → записи без оценки
    graded = django_filters.BooleanFilter(
        field_name='grade',
        lookup_expr='isnull',
        exclude=True,
        label='Оценка выставлена',
    )
    # ?group=1 → записи студентов из группы с id=1
    group = django_filters.NumberFilter(
        field_name='student__group',
        label='Группа',
    )

    class Meta:
        model = LessonEntry
        fields = ['date', 'student', 'group']
