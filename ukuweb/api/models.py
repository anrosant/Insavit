# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from form_manager.models import UserProfile
import dateutil.parser


class Interviewed(models.Model):
    alias = models.CharField(max_length=150, unique=True)
    name = models.CharField(max_length=150, null=True, blank=True)
    last_name = models.CharField(max_length=200, null=True, blank=True)
    email = models.CharField(max_length=100, null=True, blank=True)
    birthdate = models.DateField(blank=True, null=True)
    address = models.CharField(max_length=500, null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)

    def complete_name(self):
        if self.name and self.last_name:
            return "{} - {} {}".format(self.alias, self.name, self.last_name)
        if self.name:
            return "{} - {}".format(self.alias, self.name)
        return self.alias


class FormDataManager(models.Manager):
    def create(self, form):
        """
        form = {
            "codigoPlantilla": "formularioPrueba",
            "coordenadas": null,
            "data": [],
            "fechaAcceso": "2019-07-03T15:32:51.585Z",
            "fechaCreacion": "2019-07-03T15:32:51.585Z",
            "fechaGuardado": "2019-07-03T15:32:51.585Z",
            "gps": false,
            "motivo": "No puedo",
            "usuario": {"username": "user example"}
        }
        """
        access_date = dateutil.parser.parse(form.get("fechaAcceso"))
        created_date = dateutil.parser.parse(form.get("fechaCreacion"))
        send_date = dateutil.parser.parse(form.get("fechaGuardado"))
        form_data = self.model(
            type=form.get("codigoPlantilla"),
            coordinates=form.get("coordenadas", None),
            data=form.get("data"),
            access_date=access_date,
            created_date=created_date,
            send_date=send_date,
            include_gps=True if form.get("gps") == "true" else False,
            reason=form.get("motivo", None),
        )
        user = form.get("usuario", None)
        if user:
            user = UserProfile.objects.get(uid=user.get("uid"))
            form_data.user = user
        return form_data


class FormData(models.Model):
    type = models.CharField(max_length=500, blank=True)
    coordinates = models.CharField(max_length=100, null=True)
    data = models.TextField()
    access_date = models.DateField(null=True, blank=True)
    created_date = models.DateField(null=True, blank=True)
    send_date = models.DateField(null=True, blank=True)
    include_gps = models.BooleanField(default=False)
    reason = models.TextField(null=True, blank=True)
    objects = FormDataManager()
    user = models.ForeignKey(UserProfile, null=True)
    interviewed = models.ForeignKey(Interviewed, null=True)

    def to_dict(self):
        return {
            "codigoPlantilla": self.type if self.type else "",
            "coordenadas": self.coordinates if self.coordinates else "",
            "data": self.data,
            "fechaAcceso": self.access_date,
            "fechaCreacion": self.created_date,
            "fechaGuardado": self.send_date,
            "gps": self.include_gps,
            "motivo": self.reason if self.reason else "",
            "usuario": self.user.uid if self.user else "",
        }
