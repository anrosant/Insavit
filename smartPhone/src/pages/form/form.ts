import { Component } from '@angular/core';
import { NavController, MenuController, NavParams, Events, AlertController, Platform, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Coordinates, Geolocation } from '@ionic-native/geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Diagnostic } from '@ionic-native/diagnostic';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'page-form',
    templateUrl: 'form.html'
})
export class FormPage {
    template;
    formData;
    formsData = [];
    selectedTemplate;
    currentForm;
    forms;
    pendingForms;
    geolocationAuth;
    coordinates;
    templateUuid;
    funciones = [];
    loading;

    constructor(
        private diagnostic: Diagnostic,
        public alertCtrl: AlertController,
        public navParams: NavParams,
        private events: Events,
        public menuCtrl: MenuController,
        private storage: Storage,
        private geolocation: Geolocation,
        private locationAccuracy: LocationAccuracy,
        public loadingController: LoadingController,
        public navCtrl: NavController) {

        this.menuCtrl.enable(true);
        this.template = this.navParams.data.template;
        this.formData = this.navParams.data.formData;
        this.selectedTemplate = this.navParams.data.selectedTemplate;
        this.currentForm = this.navParams.data.currentForm;
        this.templateUuid = this.template.uuid;
        this.forms = this.navParams.data.forms;
        this.formsData = this.navParams.data.formsData;
        this.geolocationAuth = this.navParams.data.geolocationAuth;
        this.pendingForms = this.navParams.data.pendingForms;

        this.loading = this.loadingController.create({
            content: 'Obteniendo ubicación ...',
        });

        this.storage.get('calculos').then((calculos) => {
            for (let calc of calculos.calculos) {
                this.funciones[calc.name] = eval('var a;a=' + calc.structure);
            }
        }).catch(error => {
            console.log(JSON.stringify(error));
        });
    }

    saveForm() {
        this.currentForm.saveDate = new Date();
        this.currentForm.data = this.formData;
        let index = this.forms.length - 1;
        this.forms[index] = this.currentForm;
        this.formsData[this.templateUuid] = this.forms;
        this.storage.set("formsData", this.formsData);

        this.pendingForms[this.pendingForms.length - 1].formData = this.currentForm;
        this.storage.set("pendingForms", this.pendingForms);
    }

    editForm(index) {
        this.currentForm.data = this.formData;
        this.forms[index] = this.currentForm;
        this.storage.set(this.templateUuid, this.forms);
    }

    saveCoordinates() {
        this.currentForm.coordinates = this.coordinates;
        let index = this.forms.length - 1;
        this.forms[index] = this.currentForm;
        this.formsData[this.templateUuid] = this.forms;
        this.storage.set("formsData", this.formsData);

        this.pendingForms[this.pendingForms.length - 1].formData = this.currentForm;
        this.storage.set("pendingForms", this.pendingForms);
    }

    mappingParametros(parameters) {
        let parametrosMapeados = [];
        for (let i = 0; i < parameters.length; i++) {
            parametrosMapeados.push(this.getObjects(this.formData, 'id', parameters[i])[0]);
        }
        return parametrosMapeados;
    }

    construirFuncionDinamicaString(stringFuncion, stringParametros, lengthParametros) {
        let funcionString = stringFuncion + '(';
        for (let i = 0; i < lengthParametros; i++) {
            if (i == lengthParametros - 1) {
                funcionString = `${funcionString}${stringParametros}[${i}])`;
            }
            else {
                funcionString = `${funcionString}${stringParametros}[${i}],`;
            }
        }
        return funcionString;
    }

    triggerFunction(functionName) {
        try {
            let funcion = this.funciones[functionName];
            let args = this.getArgs(funcion);
            let parametrosMapeados = this.mappingParametros(args);
            let stringFuncionMapeada = this.construirFuncionDinamicaString('funcion', 'parametrosMapeados', parametrosMapeados.length);
            eval(stringFuncionMapeada);
        }
        catch (err) {
            let alert = this.alertCtrl.create({
                title: "Error",
                subTitle: "La funcion de calculo tiene un error interno",
                buttons: ["ok"]
            });
            alert.present();
            console.log(err.message);
        }
    }

    getObjects(obj, key, val) {
        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (typeof obj[i] == 'object') {
                objects = objects.concat(this.getObjects(obj[i], key, val));
            } else
                //if key matches and value matches or if key matches and
                //value is not passed (eliminating the case where key
                // matches but passed value does not)
                if (i == key && obj[i] == val || i == key && val == '') { //
                    objects.push(obj);
                } else if (obj[i] == val && key == '') {
                    //only add if the object is not already in the array
                    if (objects.lastIndexOf(obj) == -1) {
                        objects.push(obj);
                    }
                }
        }
        return objects;
    }

    triggerFunctionValidation(nombre_funcion, args) {
        try {
            let funcion = this.funciones[nombre_funcion];
            let parametrosMapeados = this.mappingParametros(args);
            let stringFuncionMapeada = this.construirFuncionDinamicaString('funcion', 'parametrosMapeados', parametrosMapeados.length);
            eval(stringFuncionMapeada);
            console.log("error:" + parametrosMapeados[0].error);
        }
        catch (err) {
            let alert = this.alertCtrl.create({
                title: "Error",
                subTitle: "La funcion de calculo tiene un error interno",
                buttons: ["ok"]
            });;
            alert.present();
            console.log(err.message);
        }
    }

    getArgs(func) {
        // First match everything inside the function argument parens.
        var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];
        // Split the arguments string into an array comma delimited.
        return args.split(',').map(function(arg) {
            // Ensure no inline comments are parsed and trim the whitespace.
            return arg.replace(/\/\*.*\*\//, '').trim();
        }).filter(function(arg) {
            // Ensure no undefined values are added.
            return arg;
        });
    }

    clickCollapseButton(index, id, $event) {
        let buttonElement = $event.currentTarget;
        let collapse = document.getElementById(id);
        if (collapse.getAttribute('class') == "collapse") {
            buttonElement.getElementsByTagName('ion-icon')[0].setAttribute('class', 'icon icon-md ion-md-arrow-dropdown item-icon');
        } else if (collapse.getAttribute('class') == "collapse show") {
            buttonElement.getElementsByTagName('ion-icon')[0].setAttribute('class', 'icon icon-md ion-md-arrow-dropright item-icon');
        }
    }

    clickNextPage(item2, indexCategoria, indexSubCategoria) {
        let param = this.navParams.data;
        param.selectedTemplate = item2
        this.navCtrl.push(FormPage, param);
    }

    backButtonAction() {
        alert('backbutton');
    }

    keyupFunction($event, functionName) {
        if (functionName) {
            this.triggerFunction(functionName);
        }
        this.saveForm();
    }

    blurFunction($event, functionName) {
        if (functionName != '') {
            let funcion = JSON.parse(functionName);
            for (let key in funcion) {
                let value = funcion[key];
                this.triggerFunctionValidation(key, value); //KEY: NOMBRE DE LA FUNCIÓN, VALUE: LISTA DE ARGUMENTOS
            }
        }
        this.saveForm();
    }

    clickFunction($event, functionName) {
        if (functionName) {
            this.triggerFunction(functionName);
        }
        this.saveForm();
    }

    requestLocationAuthorization() {
        this.diagnostic.requestLocationAuthorization().then(res => {
            this.geolocationAuth = res;
            this.locationAccuracy.canRequest().then((canRequest: boolean) => {
                if (canRequest) {
                    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
                        () => {
                            this.loading.present();
                            this.geolocation.getCurrentPosition({
                                enableHighAccuracy: true,
                                timeout: 12000
                            }).then((res) => {
                                this.geolocationAuth = "GRANTED";
                                this.loading.dismiss();
                                this.coordinates = {
                                    latitude: res.coords.latitude,
                                    longitude: res.coords.longitude
                                };
                                this.saveCoordinates();

                            }).catch((error) => {
                                this.loading.dismiss();
                                let alert = this.alertCtrl.create({
                                    title: "Error",
                                    subTitle: "No pudimos acceder a tu ubicación.",
                                    buttons: ["ok"]
                                });
                                alert.present();
                            });
                        }).catch(err => {
                            this.geolocationAuth = "DENIED";
                        }).catch(err => {
                            console.log(JSON.stringify(err));
                        });
                }
            }).catch(err => {
                console.log(JSON.stringify(err));
            });
        });

    }
}
