from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class UserType(models.Model):
    USER_ADMIN = "administrador"
    USER_INTERVIEWER = "entrevistador"
    ADMIN = "01"
    INTERVIEWER = "02"
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=2)


class MainUser(models.Model):
    name = models.CharField(max_length=350)
    last_name = models.CharField(max_length=350)
    user_type = models.ForeignKey(UserType)
    user = models.OneToOneField(User)


class Template(models.Model):
    type = models.CharField(max_length=500)
    name = models.CharField(max_length=500)
    structure = models.TextField()
    quantity = models.IntegerField(default=0)


class UserTemplate(models.Model):
    user = models.ForeignKey(MainUser)
    template = models.ForeignKey(Template)
