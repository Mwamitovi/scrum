# board/views.py
from rest_framework import viewsets
from board.models import Sprint
from board.serializers import SprintSerializer


class SprintViewSet(viewsets.ModelViewSet):
    """ API endpoint for listing and creating sprints """

    queryset = Sprint.objects.order_by('end')
    serializer_class = SprintSerializer

