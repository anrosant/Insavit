# -*- coding: utf-8 -*-
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.template import loader
from rest_framework.response import Response
from .models import Template, UserTemplate

# Create your views here.
def create_form(request):
    template = loader.get_template("index.html")
    context = {}
    return HttpResponse(template.render(context, request))


def templates(request, uid):
    template = loader.get_template("index.html")
    context = {}
    if request.method == "GET":
        try:
            if uid:
                user_template = UserTemplate.objects.filter(uid=uid)
                if user_template.exists():
                    context["data"] = user_template[0].template.to_dict()
                    status = 200
                else:
                    context["data"] = {"error": "Unauthorized user"}
                    status = 401
            else:
                context["data"] = {"error": "Bad request"}
                status = 400
        except Exception as e:
            print(e)
            return JsonResponse({"error": e.message}, status=400)
    else:
        context["error"] = "Méthod POST not allowed"
        status = 405
    return JsonResponse(context, status=status)
