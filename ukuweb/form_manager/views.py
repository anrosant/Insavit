from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.template import loader

# Create your views here.
def create_form(request):
    template = loader.get_template("index.html")
    context = {}
    return HttpResponse(template.render(context, request))
