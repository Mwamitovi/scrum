# board/views.py
from django.contrib.auth import get_user_model
from rest_framework import permissions, authentication
from rest_framework.pagination import PageNumberPagination
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

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


class SprintViewSet(DefaultsMixin, PageNumberPagination, ModelViewSet):
    """
    API endpoint for listing and creating sprints
    """
    queryset = Sprint.objects.order_by('end')
    serializer_class = SprintSerializer
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100


class TaskViewSet(DefaultsMixin, PageNumberPagination, ModelViewSet):
    """
    API endpoint for listing and creating tasks
    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100

































