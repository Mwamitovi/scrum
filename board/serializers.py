# board/serializers.py
from django.contrib.auth import get_user_model
from rest_framework import serializers
from board.models import Sprint, Task


User = get_user_model()


class SprintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sprint
        fields = ('id', 'name', 'description', 'end')


class TaskSerializer(serializers.ModelSerializer):

    status_display = serializers.SerializerMethodField('get_status_display')

    class Meta:
        model = Task
        fields = ('id', 'name', 'description', 'sprint', 'status', 'status_display',
                  'order', 'assigned', 'started', 'due', 'completed')

    @staticmethod
    def get_status_display(obj):
        return obj.get_status_display()



















