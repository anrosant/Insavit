from django.contrib import admin
from form_manager.models import UserProfile, UserType

# Register your models here.
admin.site.register(UserType)
admin.site.register(UserProfile)
