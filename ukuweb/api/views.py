# -*- coding: utf-8 -*-
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework_jwt.settings import api_settings
from rest_framework.permissions import AllowAny
from api.models import FormData
from form_manager.models import UserProfile


@api_view(["POST"])
@permission_classes((AllowAny,))
def validate_user(request):
    context = {}
    if request.method == "POST":
        username = request.data["username"]
        password = request.data["password"]
        try:
            user = authenticate(username=username, password=password)
        except User.DoesNotExist:
            user = None
        if user is not None and not user.is_superuser:
            user = User.objects.get(username=username)
            userProfile = UserProfile.objects.filter(user_id=user.id)
            if userProfile:
                context["uid"] = userProfile[0].uid
                context["username"] = user.username
                context["msg"] = "Ingreso exitoso"
                status = 200
            else:
                context["msg"] = "Usuario o contraseña incorrectos"
                context["data"] = {"error": "Bad request"}
                status = 400
        else:
            context["msg"] = "Usuario o contraseña incorrectos"
            context["data"] = {"error": "Bad request"}
            status = 400
    else:
        context["msg"] = "No tiene permisos"
        context["data"] = {"error": "Unauthorized user"}
        status = 401
    return JsonResponse(context, status=status)


@api_view(["POST"])
@permission_classes((AllowAny,))
def save_form_data(request):
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
        "usuario": {"username": "user example",
                    "uid": "e779204e-acd5-4c31-8e0b-4527f2f5dcc2"}
    }
    """
    context = {}
    if request.method == "POST":
        uid = request.data["usuario"].get("uid")
        userProfile = UserProfile.objects.filter(uid=uid)
        if userProfile.exists() and userProfile[0]:
            try:
                form = FormData.objects.create(request.data)
                form.save()
                context["msg"] = "Guardado correctamente"
                context["data"] = form.to_dict()
                status = 200
            except Exception as e:
                context["data"] = {"error": "Bad request"}
                status = 400
        else:
            context["data"] = {"error": "Unauthorized user"}
            status = 401
    else:
        context["data"] = {"error": "Méthod GET not allowed"}
        status = 405
    return JsonResponse(context, status=status)
