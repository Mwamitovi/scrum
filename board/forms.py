# board/forms.py
import django_filters
from board.models import Task


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

    class Meta:
        model = Task
        fields = ('sprint', 'status', 'assigned', )
