import { Component } from '@angular/core';
import { NavController, MenuController, Events, AlertController, Platform, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AuthPage } from '../auth/auth';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Coordinates, Geolocation } from '@ionic-native/geolocation';
import { FormPage } from '../form/form';
import { FollowUpPage } from '../followUp/followUp';
import { LocalNotifications } from '@ionic-native/local-notifications';
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
    geolocationAuth;
    coordinates = null;
    loading;
    selectedSection;

    constructor(private diagnostic: Diagnostic,
        private events: Events,
        private platform: Platform,
        public menuCtrl: MenuController,
        private locationAccuracy: LocationAccuracy,
        private geolocation: Geolocation,
        private storage: Storage,
        public alertCtrl: AlertController,
        public loadingController: LoadingController,
        public navCtrl: NavController,
        private localNotifications: LocalNotifications) {

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
            this.selectedSection = templates[0];
        });
        this.storage.get("formsData").then((formsData) => {
            if (formsData != null && (Object.keys(formsData).length > 0)) {
                this.formsData = formsData;
            }
        });
        this.setNotificaciones();
    }

    setNotificaciones() {
        this.storage.get('templates').then((templates) => {
            var i = 0;
            for(let template of templates) {
                for(let noti of template.notifications) {
                    var nombre = template.name;
                    var tipo = template.type;
                    var fecha = noti.date.split('-');
                    var hora = noti.time.split(':');
                    this.localNotifications.schedule({
                        id: i,
                        icon: './assets/imgs/logo_notification.png',
                        title: 'NUEVO FORMULARIO',
                        text: 'Tiene un nuevo formulario llamado ' + nombre + ' de tipo ' + tipo + ' por realizar',
                        trigger: {at: new Date(fecha[0], fecha[1] - 1, fecha[2], hora[0], hora[1])},
                        led: 'FF0000'
                    });
                    i++;
                }
            }
        });
    }

    pad(num, size) {
        var s = "00000" + num;
        return s.substr(s.length - size);
    }

    async startFollowUpForm(template, selectedTemplate, templateUuid, index) {
        this.formsData = await this.storage.get("formsData");
        let forms;
        if (this.formsData != null && (Object.keys(this.formsData).length > 0)) {
            forms = this.formsData[templateUuid];
            let initialForms = [];
            for (let form of forms) {
                if (form.type == "INICIAL")
                    initialForms.push(form);
            }
            this.storage.get('pendingForms').then((pendingForms) => {
                this.pendingForms = pendingForms;
                this.navCtrl.push(FollowUpPage, {
                    template: template,
                    coordinates: this.coordinates,
                    geolocationAuth: this.geolocationAuth,
                    selectedTemplate: selectedTemplate,
                    forms: initialForms,
                    formsData: this.formsData,
                    pendingForms: this.pendingForms,
                    infoTemplates: this.infoTemplates,
                    infoTemplateIndex: index
                });
            });
        } else{
          let alert = this.alertCtrl.create({
              subTitle: "No existen formularios iniciales.",
              buttons: ["cerrar"]
          });
          alert.present();
        }
    }

    startInitialForm(template, selectedTemplate, templateUuid, formUuid, type, index) {
        // Generate a code for Interviewed
        this.storage.get('formsData').then((formsData) => {
            this.formsData = formsData;
            let currentForm = {};
            let forms;
            if (this.formsData != null &&
                (Object.keys(this.formsData).length > 0) &&
                this.formsData.hasOwnProperty(templateUuid)) {
                forms = this.formsData[templateUuid].slice(0);
            }
            if (forms != null && (forms.length > 0)) {
                let form = forms[forms.length - 1];
                let code_number = parseInt(form.code) + 1;
                let new_code = this.pad(code_number, 5);
                currentForm = {
                    uuid: formUuid,
                    code: new_code,
                    type: type,
                    name: template.name,
                    gps: template.gps,
                    data: {},
                    createdDate: new Date()
                };
                if (template.gps == "required") {
                    currentForm["coordinates"] = this.coordinates;
                }
                forms.push(currentForm);
            }
            else {
                let new_code = this.pad(1, 5);
                currentForm = {
                    uuid: formUuid,
                    code: new_code,
                    type: type,
                    name: template.name,
                    gps: template.gps,
                    data: {},
                    createdDate: new Date()
                };
                if (template.gps == "required") {
                    currentForm["coordinates"] = this.coordinates;
                }
                forms = [currentForm];
            }
            var pendingForms = []
            this.storage.get('pendingForms').then((pendingForms) => {
                this.pendingForms = pendingForms;
                if (this.pendingForms != null && (this.pendingForms.length > 0)) {
                    pendingForms = this.pendingForms.slice(0);
                    pendingForms.push({
                        template: templateUuid,
                        formData: currentForm,
                        index: this.formsData[templateUuid].length
                    });
                } else {
                    pendingForms = [{
                        template: templateUuid,
                        formData: currentForm,
                        index: 0
                    }];
                }
                this.navCtrl.push(FormPage, {
                    template: template,
                    selectedTemplate: selectedTemplate,
                    formData: selectedTemplate,
                    currentForm: currentForm,
                    forms: forms,
                    formsData: this.formsData,
                    pendingForms: pendingForms,
                    geolocationAuth: this.geolocationAuth,
                    infoTemplates: this.infoTemplates,
                    infoTemplateIndex: index
                });
            });
        });
    }

    requestLocationAuthorization(template, templateUuid, type, index) {
        this.diagnostic.requestLocationAuthorization().then(res => {
            this.geolocationAuth = res;
            this.locationAccuracy.canRequest().then((canRequest: boolean) => {
                if (canRequest) {
                    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
                        () => {
                            this.loading = this.loadingController.create({
                                content: 'Obteniendo ubicación ...',
                            });
                            this.loading.present();
                            this.geolocation.getCurrentPosition({
                                enableHighAccuracy: true,
                                timeout: 12000
                            }).then((res) => {
                                this.loading.dismiss();
                                this.coordinates = {
                                    latitude: res.coords.latitude,
                                    longitude: res.coords.longitude
                                };
                                this.chooseFormTypeToInit(
                                    template,
                                    templateUuid,
                                    type,
                                    index);

                            }).catch((error) => {
                                this.loading.dismiss();
                                let alert = this.alertCtrl.create({
                                    title: "Error",
                                    subTitle: "No pudimos acceder a tu ubicación.",
                                    buttons: ["ok"]
                                });
                                alert.present();
                                this.chooseFormTypeToInit(
                                    template,
                                    templateUuid,
                                    type,
                                    index);
                            });
                        }).catch(err => {
                            this.geolocationAuth = "DENIED";
                            this.chooseFormTypeToInit(
                                template,
                                templateUuid,
                                type,
                                index);
                        });
                } else {
                    this.chooseFormTypeToInit(
                        template,
                        templateUuid,
                        type,
                        index);
                }
            }).catch(err => {
                console.log(JSON.stringify(err));
                this.chooseFormTypeToInit(
                    template,
                    templateUuid,
                    type,
                    index);
            });

        }).catch(err => {
            console.log(JSON.stringify(err));
            this.chooseFormTypeToInit(
                template,
                templateUuid,
                type,
                index);
        });
    }

    chooseFormTypeToInit(template, templateUuid, type, index) {
        if (type == "SEGUIMIENTO") {
            this.startFollowUpForm(template, template.data.follow_up, templateUuid, index);
        }
        else if (type == "INICIAL") {
            let formUuid = uuid();
            this.startInitialForm(template, template.data.initial, templateUuid, formUuid, type, index);
        }
        else {
            let formUuid = uuid();
            this.startInitialForm(template, template.data, templateUuid, formUuid, type, index);
        }
    }

    async startForm(template, type, index) {
        // Genereate an uuid for form
        let templateUuid = template.uuid;
        this.storage.get('infoTemplates').then((templates) => {
            for (let temp of templates) {
                if (temp.uuid == template.uuid) {
                    template = temp;
                    break;
                }
            }
            if (template.gps == "required") {
                this.requestLocationAuthorization(template, templateUuid, type, index);
            } else {
                this.chooseFormTypeToInit(template, templateUuid, type, index)
            }
        });

    }
}
