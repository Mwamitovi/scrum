# board/forms.py
import django_filters
from django.contrib.auth import get_user_model
from board.models import Task, Sprint


User = get_user_model()
EMPTY_VALUES = ([], (), {}, '', None)


class NullFilter(django_filters.BooleanFilter):
    """
    Filter on a field set as null or not
    """
    def filter(self, qs, value):
        if value in EMPTY_VALUES:
            return qs
        if self.distinct:
            qs = qs.distinct()
        lookup = '%s__isnull' % self.field_name
        qs = self.get_method(qs)(**{lookup: value})
        return qs


class TaskFilter(django_filters.FilterSet):

    backlog = NullFilter(field_name='sprint')

    class Meta:
        model = Task
        fields = ('sprint', 'status', 'assigned', 'backlog', )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.filters['assigned'].extra.update(
            {'to_field_name': User.USERNAME_FIELD}
        )


class SprintFilter(django_filters.FilterSet):

    end_min = django_filters.DateFilter(field_name='end', lookup_expr='gte')
    end_max = django_filters.DateFilter(field_name='end', lookup_expr='lte')

    class Meta:
        model = Sprint
        fields = ('end_min', 'end_max', )















