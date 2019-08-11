# -*- coding: utf-8 -*-
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.http import (
    HttpResponse,
    JsonResponse,
    HttpResponseRedirect,
    HttpResponseNotFound,
)
from django.template import loader
from rest_framework.response import Response
from .models import Template, UserTemplate, UserProfile, UserType, TemplateType
from api.models import FormData
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.contrib import messages
from django.core import urlresolvers
import ast
from api import utils as api


@login_required(login_url="login")
@require_http_methods(["GET"])
def create_template_view(request):
    context = {}
    account = request.session.get("account")
    user_id = account.get("uid")
    user_type = account.get("type")
    userProfile = UserProfile.objects.get(uid=user_id)
    if user_type == UserType.USER_ADMIN:
        template = loader.get_template("form/create.html")
        context["template_types"] = TemplateType.objects.all()
    return HttpResponse(template.render(context, request))


@login_required(login_url="login")
def create(request):
    context = {}
    account = request.session.get("account")
    user_id = account.get("uid")
    user_type = account.get("type")
    userProfile = UserProfile.objects.get(uid=user_id)
    if user_type == UserType.USER_ADMIN:
        data = request.POST
        set_name = data["setname"]
        set_id = get_set_id(set_name)
        if set_id:
            template_type = TemplateType.objects.get(code=data["type"])
            file = request.FILES.get("file")
            structure = file.read()
            template = Template(
                name=data["formname"],
                set_name=data["setname"],
                set_id=set_id,
                type=template_type,
                structure=structure,
                quantity=data["quantity"],
            )
            template.save()
            user_template = UserTemplate(user=userProfile, template=template)
            user_template.save()
            messages.success(request, "Plantilla Creada correctamente")
            return redirect(urlresolvers.reverse("templates"))
        else:
            messages.error(request, "El conjunto de datos no existe")
            return redirect(urlresolvers.reverse("create-template-view"))
    return HttpResponse(template.render(context, request))


@login_required(login_url="login")
@require_http_methods(["GET"])
def templates_list(request):
    context = {}
    account = request.session.get("account")
    user_id = account.get("uid")
    user_type = account.get("type")
    userProfile = UserProfile.objects.get(uid=user_id)
    if user_type == UserType.USER_ADMIN:
        template = loader.get_template("form/list.html")
        user_templates = UserTemplate.objects.filter(user=userProfile)
        templates = []
        if user_templates:
            for user_template in user_templates:
                templates.append(user_template.template)
        context["templates"] = templates
    return HttpResponse(template.render(context, request))


@login_required(login_url="login")
@require_http_methods(["GET"])
def view(request, template_uid):
    template_obj = Template.objects.filter(uid=template_uid)
    if template_obj.exists():
        template_obj = template_obj.get()
        formsData = FormData.objects.filter(template__id=template_obj.id)
        objs = []
        if formsData.exists():
            for formData in formsData:
                data = formData.data
                objs.append(ast.literal_eval(data))
            head, body = api.convert_data_into_head_body(objs)
            template = loader.get_template("form-data.html")
            context = {"template": template_obj.name, "head": head, "body": body}
            return HttpResponse(template.render(context, request))
    else:
        return HttpResponseNotFound("Formulario no existe")


def logout_user(request):
    logout(request)
    return redirect("login")


def separate_form_by_type(forms):
    forms_dict = {}
    for form in forms:
        forms_dict[form.type.name] = forms_dict.get(form.type.name, []) + [
            form.to_dict()
        ]
    return forms_dict


@login_required(login_url="login")
@require_http_methods(["GET"])
def home(request):
    account = request.session.get("account")
    user_id = account.get("uid")
    user_type = account.get("type")
    userProfile = UserProfile.objects.get(uid=user_id)
    formsData = []
    if user_type == UserType.USER_ADMIN:
        userTemplates = UserTemplate.objects.filter(user=userProfile)
        for userTemplate in userTemplates:
            template = userTemplate.template
            formData = {"template": template, "formsInfo": {}}
            users_assigned = UserTemplate.objects.filter(
                template__id=template.id
            ).exclude(user__uid=user_id)
            formsDataList = []
            if users_assigned.exists():
                for user_assigned in users_assigned:
                    formsDataList += FormData.objects.filter(
                        user__uid=user_assigned.user.uid
                    )
                formData["formsInfo"] = separate_form_by_type(formsDataList)
                formsData.append(formData)
    else:
        formsData = FormData.objects.filter(user=userProfile)
    template = loader.get_template("index.html")
    context = {"username": userProfile.name, "forms": formsData, "user_type": user_type}
    return HttpResponse(template.render(context, request))


@require_http_methods(["GET", "POST"])
def login_user(request):
    template = loader.get_template("index.html")
    if request.POST:
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(username=username, password=password)
        if user is not None:
            userProfile = UserProfile.objects.filter(user=user)
            if userProfile.exists():
                is_admin = userProfile.get().user_type.code == UserType.ADMIN
                if is_admin:
                    request.session["account"] = {
                        "uid": userProfile.get().uid,
                        "type": "administrador",
                    }

                else:
                    request.session["account"] = {
                        "uid": userProfile.get().uid,
                        "type": "entrevistador",
                    }
                login(request, user)
                return HttpResponseRedirect("/")

            else:
                messages.error(request, "No existe el usuario")
                return redirect(urlresolvers.reverse("login"))
        else:
            messages.error(request, "Usuario o contraseña incorrecto")
            return redirect(urlresolvers.reverse("login"))
    else:
        context = {}
        template = loader.get_template("login.html")
        return HttpResponse(template.render(context, request))


def templates(request, uid):
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


def export_form(request, uid):
    form = FormData.objects.filter(uid=uid)
    if form.exists():
        form = form.get()
        filename = "{0}-{1}.xlsx".format(
            form.name.encode("utf-8").decode("string_escape"), form.created_date
        )
        output = api.convert_form_to_excel(form, filename)
        response = HttpResponse(
            output,
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = "attachment; filename=%s" % filename
        return response
    else:
        messages.error(request, "El archivo no existe")
        return redirect(urlresolvers.reverse("home"))
