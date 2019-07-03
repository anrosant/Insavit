from django.conf.urls import url
from . import views

urlpatterns = [
    url(r"^create/", views.create_form, name="create"),
    url(r"^templates/(?P<uid>[a-zA-Z0-9_\-]{1,36})$", views.templates, name="get"),
]
