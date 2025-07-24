
from django.db import models

class Project(models.Model):
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Image(models.Model):
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='image')
    title = models.CharField(max_length=100)
    image_file = models.ImageField(upload_to='images/')
    created_at = models.DateTimeField(auto_now_add=True)

class Layer(models.Model):
    image = models.ForeignKey(Image, on_delete=models.CASCADE, related_name='layers')
    layer_id = models.IntegerField()
    shape_type = models.CharField(max_length=50)
    properties = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
