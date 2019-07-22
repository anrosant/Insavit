import { Component } from '@angular/core';
import { NavController, MenuController, Events, AlertController, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AuthPage } from '../auth/auth';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Diagnostic } from '@ionic-native/diagnostic';
import { FormPage } from '../form/form';
import { FollowUpPage } from '../followUp/followUp';
import uuid from 'uuid/v4';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    sentForms;
    templates;
    infoTemplates = [];
    pendingForms = [];
    formsData = {};

    constructor(private diagnostic: Diagnostic,
        private events: Events,
        public menuCtrl: MenuController,
        private storage: Storage,
        public navCtrl: NavController) {

        this.menuCtrl.enable(true);

        this.storage.get('sentForms').then((sentForms) => {
            this.sentForms = sentForms;
        });

        this.storage.get('templates').then((templates) => {
            this.templates = templates;
        });
        this.storage.get('pendingForms').then((pendingForms) => {
            this.pendingForms = pendingForms;
        });
        this.storage.get('infoTemplates').then((templates) => {
            this.infoTemplates = templates;
        });
        this.storage.get("formsData").then((formsData) => {
            if (formsData != null && (Object.keys(formsData).length > 0)) {
                this.formsData = formsData;
            }
        });
    }
    pad(num, size) {
        var s = "00000" + num;
        return s.substr(s.length-size);
    }

    increase_done_quantity(template) {
        if (template.type == "SIMPLE") {
            template.done_quantity += 1;
        }
        else {
            for (let type of template.quantity) {
                if (type.type == "INICIAL")
                    type.done_quantity += 1;
            }
        }
        this.storage.set('infoTemplates', this.infoTemplates);
    }

    decrease_remain_quantity(template) {
        if (template.type == "SIMPLE") {
            template.remain_quantity -= 1;
        }
        else {
            for (let type of template.quantity) {
                if (type.type == "INICIAL")
                    type.remain_quantity -= 1;
            }
        }
        this.storage.set('infoTemplates', this.infoTemplates);
    }

    startFollowUpForm(template, selectedTemplate, templateUuid, index) {
        let forms;
        if (this.formsData != null && (Object.keys(this.formsData).length > 0)) {
            forms = this.formsData[templateUuid];
            let initialForms = [];
            for (let form of forms) {
                if (form.type == "INICIAL")
                    initialForms.push(form);
            }
            this.navCtrl.push(FollowUpPage, {
                template: template,
                index: index,
                selectedTemplate: selectedTemplate,
                forms: initialForms,
                formsData: this.formsData,
                pendingForms: this.pendingForms
            });
        }
    }

    startInitialForm(template, selectedTemplate, templateUuid, formUuid, type) {
        // Generate a code for Interviewed
        let currentForm = {};
        let forms;
        if (this.formsData != null && (Object.keys(this.formsData).length>0)) {
            forms = this.formsData[templateUuid];
        }
        if (forms != null && (forms.length > 0)) {
            let form = forms[forms.length - 1];
            let code_number = parseInt(form.code[form.code.length - 1]) + 1;
            let new_code = this.pad(code_number, 5);
            currentForm = {
                uuid: formUuid,
                code: new_code,
                type: type,
                name: template.name,
                data: {},
                createdDate: new Date()
            };
            forms.push(currentForm);
        }
        else {
            let new_code = this.pad(1, 5);
            currentForm = {
                uuid: formUuid,
                code: new_code,
                type: type,
                name: template.name,
                data: {},
                createdDate: new Date()
            };
            forms = [currentForm];
        }
        this.formsData[templateUuid] = forms
        this.storage.set("formsData", this.formsData);
        if (this.pendingForms != null && (this.pendingForms.length > 0)){
          this.pendingForms.push({
            template: templateUuid,
            formData: currentForm,
            index: this.formsData[templateUuid].length -1
          });
        }else{
          this.pendingForms = [{
            template: templateUuid,
            formData: currentForm,
            index: 0
          }];
        }
        this.storage.set("pendingForms", this.pendingForms);
        this.decrease_remain_quantity(template)
        this.increase_done_quantity(template)
        this.navCtrl.push(FormPage, {
            template: template,
            selectedTemplate: selectedTemplate,
            formData: selectedTemplate,
            currentForm: currentForm,
            forms: forms,
            formsData: this.formsData,
            pendingForms: this.pendingForms
        });
    }

    startForm(template, type, index) {
        // Genereate an uuid for form
        let templateUuid = template.uuid;
        if (type == "SEGUIMIENTO") {
            this.startFollowUpForm(template, template.data.follow_up, templateUuid, index);
        }
        else if (type == "INICIAL") {
            let formUuid = uuid();
            this.startInitialForm(template, template.data.initial, templateUuid, formUuid, type);
        }
        else {
            let formUuid = uuid();
            this.startInitialForm(template, template.data, templateUuid, formUuid, type);
        }

    }
}
