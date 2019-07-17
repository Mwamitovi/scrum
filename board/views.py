# board/views.py
from rest_framework import permissions, authentication
from rest_framework.pagination import PageNumberPagination
from rest_framework.viewsets import ModelViewSet
from board.models import Sprint
from board.serializers import SprintSerializer


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


class SprintViewSet(DefaultsMixin, ModelViewSet, PageNumberPagination):
    """
    API endpoint for listing and creating sprints
    """
    queryset = Sprint.objects.order_by('end')
    serializer_class = SprintSerializer
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100

