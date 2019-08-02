from django.contrib import admin
from form_manager.models import UserProfile, UserType, Template, TemplateType
from api.models import FormData

# Register your models here.
admin.site.register(UserType)
admin.site.register(TemplateType)
admin.site.register(UserProfile)
admin.site.register(FormData)
admin.site.register(Template)
