from rest_framework import serializers
from models.models import Image, BeanDetection


class MultipleImageUploadSerializer(serializers.Serializer):
    """
    Serializer for handling multiple image uploads with optional comment
    """
    images = serializers.ListField(
        child=serializers.ImageField(),
        allow_empty=False,
        max_length=10  # Limit to 10 images per request
    )
    comment = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=1000
    )


class BeanDetectionSerializer(serializers.ModelSerializer):
    """
    Serializer for bean detection results
    """
    class Meta:
        model = BeanDetection
        fields = ['id', 'bean_id', 'length_mm', 'width_mm', 
                 'bbox_x', 'bbox_y', 'bbox_width', 'bbox_height',
                 'features', 'comment', 'created_at']


class BeanProcessingResultSerializer(serializers.Serializer):
    """
    Serializer for bean processing results
    """
    image_id = serializers.CharField()
    image_dimensions_mm = serializers.DictField()
    calibration = serializers.DictField()
    beans = serializers.ListField()
    debug_images = serializers.DictField()
    total_beans_detected = serializers.IntegerField()
    error = serializers.CharField(required=False)
