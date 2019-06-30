# coding=utf-8
from django.shortcuts import render
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework_jwt.settings import api_settings
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from api.models import FormData


@api_view(["GET", "POST"])
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
            """Función que genera tokens de usuarios"""
            jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
            jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

            user = User.objects.get(username=username)
            payload = jwt_payload_handler(user)
            token = jwt_encode_handler(payload)
            context["token"] = token
            user.token = token
            context["userId"] = user.id
            context["msj"] = "Ingreso exitoso"
        else:
            context["msj"] = "Usuario o contraseña incorrectos"
    else:
        context["msj"] = "No tiene permisos"
    return Response(context)


@api_view(["GET", "POST"])
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
        "usuario": {"username": "user example", "token": "token"}
    }
    """
    context = {}
    if request.method == "POST":
        username = request.data["usuario"].get("username")
        user = User.objects.get(username=username)
        if user is not None:
            try:
                form = FormData.objects.create(request.data)
                form.save()
                context["msj"] = "Guardado correctamente"
                context["data"] = form.to_dict()
            except Exception as e:
                context["error"] = "Parámetros incorrectos"
                print(e)
        else:
            context["msj"] = "Usuario no autorizado"
    elif request.method == "GET":
        form = FormData.objects.all()
        context["created"] = form
    else:
        context["msj"] = "Método no permitido"
    return Response(context)
