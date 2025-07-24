
from rest_framework import serializers
from .models import Project, Image, Layer

class LayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Layer
        fields = '__all__'

class ImageSerializer(serializers.ModelSerializer):
    layers = LayerSerializer(many=True, read_only=True)

    class Meta:
        model = Image
        fields = '__all__'
        
class ImageUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['project', 'title', 'image_file']

class ProjectSerializer(serializers.ModelSerializer):
    image = ImageSerializer(read_only=True)

    class Meta:
        model = Project
        fields = '__all__'

class ProjectCreateSerializer(serializers.ModelSerializer):
    image_file = serializers.ImageField(write_only=True)

    class Meta:
        model = Project
        fields = ['title', 'description', 'image_file']

    def create(self, validated_data):
        image_file = validated_data.pop('image_file')
        project = Project.objects.create(**validated_data)
        Image.objects.create(project=project, title=f"{project.title} Image", image_file=image_file)
        return project
