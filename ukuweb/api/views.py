# -*- coding: utf-8 -*-
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework_jwt.settings import api_settings
from rest_framework.permissions import AllowAny
from api.models import FormData
from form_manager.models import UserProfile, TemplateType


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
        "formData": {
            "code": "00001"
            "createdDate": Sat Jul 20 2019 12:51:34 GMT-0500 (hora de Ecuador)
            "data": {}
            "name": "Nutrición - Puyo"
            "type": "SIMPLE"
            "uuid": "e471fda6-1590-4341-9cf4-a29e9d59b0ae",
            "gps": false,
            "coordinates": null
        },
        "user": {
            "username": "user example",
            "uid": "e779204e-acd5-4c31-8e0b-4527f2f5dcc2"
            }
    }
    """
    context = {}
    if request.method == "POST":
        uid = request.data["user"].get("uid")
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
        context["data"] = {"error": "Method GET not allowed"}
        status = 405
    return JsonResponse(context, status=status)


def getInfoTemplateData(template):
    data = {"name": template.name, "uuid": template.uid, "type": template.type.name}
    infoTemp = InfoTemplate.objects.filter(template__id=template.id)
    if template.type == TemplateType.FOLLOWUP:
        quantity = []
        if infoTemp.exists():
            for inf in infoTemp:
                if inf.remain_quantity > 0:
                    quantity.append(
                        {
                            "done_quantity": inf.done_quantity,
                            "remain_quantity": inf.remain_quantity,
                            "type": inf.type.name,
                        }
                    )
        else:
            quantity = [
                {
                    "done_quantity": 0,
                    "remain_quantity": template.quantity,
                    "type": TemplateType.INITIAL,
                },
                {
                    "done_quantity": 0,
                    "remain_quantity": template.quantity,
                    "type": TemplateType.FOLLOWUP,
                },
            ]

        data["quantity"] = quantity
    else:
        if infoTemp.exists():
            # If form was completed
            if infoTemp[0].remain_quantity > 0:
                data["done_quantity"] = infoTemp[0].done_quantity
                data["remain_quantity"] = infoTemp[0].remain_quantity
            else:
                return None
        else:
            data["done_quantity"] = 0
            data["remain_quantity"] = template.quantity
    return data


def getTemplatesData(userProfile):
    userTemplates = UserTemplate.objects.filter(user__id=userProfile.id)
    templates = []
    infoTemplates = []
    for userTemplate in userTemplates:
        template = userTemplate.template
        if template and template.quantity > 0:
            templates.append(template.to_dict())
            infoTemplate = getInfoTemplateData(template)
            if infoTemplate:
                infoTemplates.append(infoTemplate)
    return {"templates": templates, "infoTemplates": infoTemplates}
