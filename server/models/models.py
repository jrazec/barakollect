from django.contrib.gis.db import models 



class Location(models.Model):
    id = models.BigAutoField(primary_key=True)
    location = models.PointField(geography=True, blank=True, null=True)
    name = models.CharField(max_length=255, unique=True)
    
    class Meta:
        db_table = "locations"

# ==================+USER MANAGEMENT & RBAC+==================
class User(models.Model):

    id = models.UUIDField(primary_key=True, editable=False)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    avatar_image = models.TextField(blank=True, null=True)
    registration_date = models.DateTimeField()
    is_deleted = models.BooleanField(default=False)
    username = models.CharField(max_length=255, unique=True)
    last_login = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True)
    class Meta:
        db_table = "users"  
        managed = False     

class Role(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)

    class Meta:
        db_table = "roles"


class Permission(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)

    class Meta:
        db_table = "permissions"


class UserRole(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, primary_key=True)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)

    class Meta:
        db_table = "user_roles"
        managed = False
        unique_together = ("user", "role")


class RolePermission(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)

    class Meta:
        db_table = "role_permissions"
        unique_together = ("role", "permission")



# ==================+ACTIVITY & NOTIFICATIONS+==================
class ActivityLog(models.Model):
    ACTION_CHOICES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('VIEW', 'View'),
        ('DOWNLOAD', 'Download'),
        ('UPLOAD', 'Upload'),
        ('ACTIVATE', 'Activate'),
        ('DEACTIVATE', 'Deactivate'),
        ('EXPORT', 'Export'),
        ('IMPORT', 'Import'),
    ]

    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    description = models.TextField()
    action = models.CharField(max_length=150, choices=ACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "activity_logs"


class Notification(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=50)  # e.g., 'info', 'warning', 'error'
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"





# ==================+IMAGES & PREDICTIONS+==================
class Image(models.Model):
    id = models.BigAutoField(primary_key=True)
    image_url = models.TextField()
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True)
    upload_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "images"


class UserImage(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.ForeignKey(Image, on_delete=models.CASCADE)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        db_table = "user_images"
        unique_together = ('user', 'image')
        managed = False


class Annotation(models.Model):
    id = models.BigAutoField(primary_key=True)
    image = models.ForeignKey(Image, on_delete=models.CASCADE)
    label = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "annotations"


class Prediction(models.Model):
    id = models.BigAutoField(primary_key=True)
    image = models.ForeignKey(Image, on_delete=models.CASCADE)
    model_used = models.CharField(max_length=150)
    confidence_score = models.DecimalField(max_digits=10, decimal_places=5)
    predicted_label = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "predictions"
        managed = False


class ExtractedFeature(models.Model):
    id = models.BigAutoField(primary_key=True)
    prediction = models.ForeignKey(Prediction, on_delete=models.CASCADE)
    area = models.DecimalField(max_digits=20, decimal_places=5)
    perimeter = models.DecimalField(max_digits=20, decimal_places=5)
    major_axis_length = models.DecimalField(max_digits=20, decimal_places=5)
    minor_axis_length = models.DecimalField(max_digits=20, decimal_places=5)
    extent = models.DecimalField(max_digits=20, decimal_places=5)
    eccentricity = models.DecimalField(max_digits=20, decimal_places=5)
    convex_area = models.DecimalField(max_digits=20, decimal_places=5)
    solidity = models.DecimalField(max_digits=20, decimal_places=5)
    mean_intensity = models.DecimalField(max_digits=20, decimal_places=5)
    equivalent_diameter = models.DecimalField(max_digits=20, decimal_places=5)

    class Meta:
        db_table = "extracted_features"


class BeanDetection(models.Model):
    """
    Model to store individual bean detection results
    """
    id = models.BigAutoField(primary_key=True)
    extracted_features = models.ForeignKey(ExtractedFeature, on_delete=models.CASCADE)
    bean_id = models.IntegerField()  # Bean number within the image
    length_mm = models.DecimalField(max_digits=10, decimal_places=3)
    width_mm = models.DecimalField(max_digits=10, decimal_places=3)
    bbox_x = models.IntegerField()
    bbox_y = models.IntegerField()
    bbox_width = models.IntegerField()
    bbox_height = models.IntegerField()
    comment = models.TextField(blank=True, null=True)  # Optional comment
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "bean_detections"
        unique_together = ('extracted_features', 'bean_id')

