# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
import uuid

# Create your models here.
class UserType(models.Model):
    USER_ADMIN = "administrador"
    USER_INTERVIEWER = "entrevistador"
    ADMIN = "01"
    INTERVIEWER = "02"
    name = models.CharField(max_length=30)
    code = models.CharField(max_length=2)

    def __unicode__(self):
        return self.name


class TemplateType(models.Model):
    INITIAL_TEMPLATE = "INICIAL"
    FOLLOWUP_TEMPLATE = "SEGUIMIENTO"
    SIMPLE_TEMPLATE = "SIMPLE"
    COMPOUND_TEMPLATE = "COMPUESTA"
    INITIAL = "01"
    FOLLOWUP = "02"
    SIMPLE = "03"
    COMPOUND = "04"
    name = models.CharField(max_length=30)
    code = models.CharField(max_length=2)

    def __unicode__(self):
        return self.name


class UserProfile(models.Model):
    uid = models.CharField(
        primary_key=True, default=uuid.uuid4, editable=False, max_length=36
    )
    name = models.CharField(max_length=350)
    last_name = models.CharField(max_length=350)
    user_type = models.ForeignKey(UserType)
    user = models.OneToOneField(User)

    def __unicode__(self):
        return self.name


class Template(models.Model):
    uid = models.CharField(default=uuid.uuid4, editable=False, max_length=36)
    type = models.ForeignKey(TemplateType)
    name = models.CharField(max_length=500)
    structure = models.TextField()
    quantity = models.IntegerField(default=0)

    def to_dict(self):
        return {
            "uid": self.uid,
            "type": self.type,
            "name": self.name,
            "data": self.structure,
            "quantity": self.quantity,
        }


class UserTemplate(models.Model):
    user = models.ForeignKey(UserProfile)
    template = models.ForeignKey(Template)


class InfoTemplate(models.Model):
    done_quantity = models.IntegerField()
    remain_quantity = models.IntegerField()
    type = models.ForeignKey(TemplateType)
    template = models.ForeignKey(Template)
