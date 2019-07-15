from django.contrib import admin
from form_manager.models import UserProfile, UserType, TemplateType

# Register your models here.
admin.site.register(UserType)
admin.site.register(TemplateType)
admin.site.register(UserProfile)
