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
from .models import Template, UserTemplate, UserProfile, UserType
from api.models import FormData
from django.contrib.auth.models import User
import xlsxwriter
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.contrib import messages
from django.core import urlresolvers
import ast

# Create your views here.
@login_required(login_url="login")
@require_http_methods(["GET"])
def view(request, template_uid):
    # Agregar template al formData
    template_obj = Template.objects.filter(uid=template_uid)
    if template_obj.exists():
        template_obj = template_obj.get()
        formsData = FormData.objects.filter(template__id=template_obj.id)
        objs = []
        if formsData.exists():
            for formData in formsData:
                data = formData.data
                objs.append(ast.literal_eval(data))
            head, body = convert_data_into_head_body(objs)
            # convert_to_xls(head, body, "Datos")
            template = loader.get_template("form-data.html")
            context = {"template": template_obj.name, "head": head, "body": body}
            return HttpResponse(template.render(context, request))
    else:
        return HttpResponseNotFound("Formulario no existe")


def get_values_in_xls():
    formsData = FormData.objects.all()
    objs = []
    for formData in formsData:
        data = formData.data
        objs.append(ast.literal_eval(data))
        head, body = convert_data_into_head_body(objs)
        convert_to_xls(head, body, "Datos")


# @login_required(login_url="login")
# @require_http_methods(["GET"])
# def view_form(request, template_uid):
#     # Agregar template al formData
#     template_obj = Template.objects.filter(uid=template_uid)
#     if template_obj.exists():
#         template_obj = template_obj.get()
#         formsData = FormData.objects.filter(template__id=template_obj.id)
#         objs = []
#         if formsData.exists():
#             for formData in formsData:
#                 data = formData.data
#                 objs.append(ast.literal_eval(data))
#             head, body = convert_data_into_head_body(objs)
#             # convert_to_xls(head, body, "Datos")
#             template = loader.get_template("form-data.html")
#             context = {"template": template_obj.name, "head": head, "body": body}
#             print(context["template"])
#             return HttpResponse(template.render(context, request))
#     else:
#         return HttpResponseNotFound("Formulario no existe")


def logout_user(request):
    logout(request)
    return redirect("login")


def separate_form_by_type(forms):
    forms_dict = {}
    for form in forms:
        forms_dict[form.type.name] = forms_dict.get(form.type.name, []) + [form]
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


def get_labels_values(obj):
    objects = []
    for i in obj:
        is_key = type(obj) is dict and type(i) is not dict and type(i) is not list
        is_dict = type(i) is dict
        if is_key:
            next_value_is_dict = type(obj[i]) is dict or type(obj[i]) is list
            if next_value_is_dict:
                objects = objects + get_labels_values(obj[i])
        elif is_dict:
            has_key_and_value = (
                (i.get("label", None) is not None and i.get("value", None) is not None)
                or (
                    i.get("label", None) is not None
                    and i.get("checked", None) is not None
                )
                or (
                    i.get("label", None) is not None
                    and i.get("text1", None) is not None
                )
                or (
                    i.get("label", None) is not None
                    and i.get("text2", None) is not None
                )
                or (
                    i.get("label2", None) is not None
                    and i.get("checked", None) is not None
                )
            )
            if has_key_and_value:
                key = "label" if i.get("label", None) else "label2"
                objects.append({i[key]: "sub_label"})
            else:
                has_key_and_type = i.get("label", None) is not None and i.get(
                    "type", None
                )
                if has_key_and_type:
                    if (
                        i["type"] == "checkbox_input"
                        or i["type"] == "table_2"
                        or i["type"] == "table"
                    ):
                        objects.append({i["label"]: len(i["children"])})
                    elif i["type"] == "table_recordatorio":
                        objects.append(
                            {
                                "RECORDATORIO": [
                                    {"header": i["placeholder_1"]},
                                    {"header": i["placeholder_2"]},
                                    {"header": i["placeholder_3"]},
                                    {"header": i["placeholder_4"]},
                                    {"header": i["placeholder_5"]},
                                ]
                            }
                        )
                objects = objects + get_labels_values(i)
    return objects


def get_table_header(obj):
    objects = []
    for i in obj:
        is_key = type(obj) is dict and type(i) is not dict and type(i) is not list
        is_dict = type(i) is dict
        if is_key:
            next_value_is_dict = type(obj[i]) is dict or type(obj[i]) is list
            if next_value_is_dict:
                objects = objects + get_table_header(obj[i])
        elif is_dict:
            has_type = i.get("type", None)
            if has_type and i["type"] == "table_recordatorio":
                objects.append(
                    {
                        "RECORDATORIO": [
                            {"header": i["placeholder_1"]},
                            {"header": i["placeholder_2"]},
                            {"header": i["placeholder_3"]},
                            {"header": i["placeholder_4"]},
                            {"header": i["placeholder_5"]},
                        ]
                    }
                )
            objects = objects + get_table_header(i)
    return objects


def get_table_values(obj):
    data_table = []
    for i in obj:
        is_key = type(obj) is dict and type(i) is not dict and type(i) is not list
        is_dict = type(i) is dict
        if is_key:
            next_value_is_dict = type(obj[i]) is dict or type(obj[i]) is list
            if next_value_is_dict:
                data_table = data_table + get_table_values(obj[i])
        elif is_dict:
            has_text1_text2_text3_text4_value = (
                i.get("label", None) is not None
                and i.get("text1", None) is not None
                and i.get("text2", None) is not None
                and i.get("text3", None) is not None
                and i.get("text4", None) is not None
                and i.get("value", None) is not None
            )
            if has_text1_text2_text3_text4_value:
                data_table.append(
                    [i["text1"], i["text2"], i["text3"], i["text4"], i["value"]]
                )
            else:
                data_table = data_table + get_table_values(i)
    return data_table


def get_table_recordatorio(obj):
    header = get_table_header(obj)
    values = get_table_values(obj)


def get_values(obj):
    values = []
    for i in obj:
        is_key = type(obj) is dict and type(i) is not dict and type(i) is not list
        is_dict = type(i) is dict
        if is_key:
            next_value_is_dict = type(obj[i]) is dict or type(obj[i]) is list
            if next_value_is_dict:
                values = values + get_values(obj[i])
        elif is_dict:
            has_key_and_value = (
                i.get("label", None) is not None and i.get("value", None) is not None
            )
            has_key_and_checked = (
                i.get("label", None) is not None and i.get("checked", None) is not None
            )
            has_label2_and_checked = (
                i.get("label2", None) is not None and i.get("checked", None) is not None
            )
            has_key_refer_and_text1 = (
                i.get("label", None) is not None
                and i.get("text1", None) is not None
                and i.get("refiere", None) is not None
            )
            has_key_and_text2 = (
                i.get("label", None) is not None and i.get("text2", None) is not None
            )
            has_text1_text2_text3_text4_value = (
                i.get("label", None) is not None
                and i.get("text1", None) is not None
                and i.get("text2", None) is not None
                and i.get("text3", None) is not None
                and i.get("text4", None) is not None
                and i.get("value", None) is not None
            )
            if has_text1_text2_text3_text4_value:
                values.append(
                    [i["text1"], i["text2"], i["text3"], i["text4"], i["value"]]
                )
            elif has_key_and_value:
                values.append(i["value"])
            elif has_key_and_checked or has_label2_and_checked:
                values.append(i["checked"])
            elif has_key_refer_and_text1:
                if i["refiere"]:
                    values.append(i["text1"])
                else:
                    values.append("No refiere")
            elif has_key_and_text2:
                values.append(i["text2"])
            else:
                values = values + get_values(i)
    return values


def convert_data_into_head_body(objs):
    body = []
    head = get_labels_values(objs[0])
    for obj in objs:
        body.append(get_values(obj))
    return (head, body)


def convert_to_xls(head_list, body_list, title):
    workbook = xlsxwriter.Workbook(title + ".xlsx")
    bold = workbook.add_format({"bold": True})
    worksheet = workbook.add_worksheet()

    col = 0
    for head_dict in head_list:
        label = head_dict.keys()[0]
        label_type = head_dict[label]
        label = label.encode("utf-8").decode("string_escape").decode("utf-8")
        if label_type == "sub_label":
            worksheet.write(1, col, label, bold)
            worksheet.set_column(1, col, len(label) + 10)
            col += 1
        else:
            worksheet.write(0, col, label, bold)
    row = 2
    col = 0

    for value_list in body_list:
        for value in value_list:
            if type(value) == bool:
                value = "Verdadero" if value else "Falso"
                worksheet.write(row, col, value)
                col += 1
            else:
                worksheet.write(
                    row,
                    col,
                    value.encode("utf-8").decode("string_escape").decode("utf-8"),
                )
                col += 1
        col = 0
        row += 1

    workbook.close()


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
