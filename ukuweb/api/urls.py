from django.conf.urls import url
from . import views

urlpatterns = [url(r"^validate_user/", views.validate_user, name="validate")]
