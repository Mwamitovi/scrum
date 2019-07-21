# board/views.py
from collections import OrderedDict
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework import permissions, authentication, filters
from rest_framework.pagination import PageNumberPagination
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from django_filters.rest_framework import DjangoFilterBackend

from board.serializers import SprintSerializer, TaskSerializer, UserSerializer
from board.models import Sprint, Task


User = get_user_model()


class DefaultsMixin(object):
    """
    Default settings for view authentication, permissions, filtering
    """
    authentication_classes = [
        authentication.BasicAuthentication,
        authentication.TokenAuthentication,
    ]
    permission_classes = [
        permissions.IsAuthenticated,
    ]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]


class DefaultsPagination(PageNumberPagination):
    """
    Default settings for view pagination
    """
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('limit', self.page_size),
            ('results', data)
        ]))


class SprintViewSet(DefaultsMixin, ModelViewSet):
    """
    API endpoint for listing and creating sprints
    """
    queryset = Sprint.objects.order_by('end')
    serializer_class = SprintSerializer
    pagination_class = DefaultsPagination
    search_fields = ('name', )
    ordering_fields = ('end', 'name', )


class TaskViewSet(DefaultsMixin, ModelViewSet):
    """
    API endpoint for listing and creating tasks
    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    pagination_class = DefaultsPagination
    search_fields = ('name', 'description', )
    ordering_fields = ('name', 'order', 'started', 'due', 'completed', )


class UserViewSet(DefaultsMixin, ReadOnlyModelViewSet):
    """
    API endpoint for listing users
    """
    lookup_field = User.USERNAME_FIELD
    lookup_url_kwarg = User.USERNAME_FIELD
    queryset = User.objects.order_by(User.USERNAME_FIELD)
    serializer_class = UserSerializer
    pagination_class = DefaultsPagination
    search_fields = (User.USERNAME_FIELD, )
