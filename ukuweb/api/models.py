from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
import datetime


class FormDataManager(models.Manager):
    def create(self, form):
        """
        form = {
            "codigoPlantilla": "formularioPrueba",
            "coordenadas": null,
            "data": [],
            "fechaAcceso": "22/01/2019",
            "fechaCreacion": "22/01/2019",
            "fechaGuardado": "22/01/2019",
            "gps": false,
            "motivo": "No puedo",
            "usuario": {"username": "user example"}
        }
        """
        access_date = datetime.datetime.strptime(
            " ".join(form.get("fechaAcceso").split(" ")[:5]), "%a %b %d %Y %H:%M:%S"
        )
        created_date = datetime.datetime.strptime(
            " ".join(form.get("fechaCreacion").split(" ")[:5]), "%a %b %d %Y %H:%M:%S"
        )
        send_date = datetime.datetime.strptime(
            " ".join(form.get("fechaGuardado").split(" ")[:5]), "%a %b %d %Y %H:%M:%S"
        )
        form_data = self.model(
            type=form.get("codigoPlantilla"),
            coordinates=form.get("coordenadas", None),
            data=form.get("data"),
            access_date=access_date,
            created_date=created_date,
            send_date=send_date,
            include_gps=form.get("gps"),
            reason=form.get("motivo", None),
        )
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
        }
