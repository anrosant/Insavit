from django.conf.urls import url
from . import views

urlpatterns = [
    url(
        r"^templates/create_view/",
        views.create_template_view,
        name="create-template-view",
    ),
    url(r"^templates/create/$", views.create, name="create-template"),
    url(r"^templates/$", views.templates_list, name="templates"),
    url(r"^templates/(?P<uid>[a-zA-Z0-9_\-]{1,36})$", views.templates, name="get"),
    url(r"^form/(?P<uid>[a-zA-Z0-9_\-]{1,36})$", views.export_form, name="export-form"),
]
