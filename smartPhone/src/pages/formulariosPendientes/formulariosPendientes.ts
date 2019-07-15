import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Events, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'page-formulariosPendientes',
    templateUrl: 'formulariosPendientes.html'
})

export class formulariosPendientesPage {
    formulariosPendientes = [];
    comprobandoPendientes = true;
    enviandoFormularios = false;

    constructor(public alertCtrl: AlertController, public httpClient: HttpClient, private events: Events,
        private datePipe: DatePipe, private storage: Storage, public navCtrl: NavController,
        public navParams: NavParams) {
        this.getFormulariosPendientes();
        this.events.subscribe('app:envioFormularios', (status) => {
            if (!status) {
                this.getFormulariosPendientes();
            }
        });
        console.log(navCtrl.getViews());

    }

    getFormulariosPendientes() {
        this.formulariosPendientes = [];
        console.log('-----FOR EACH PENDIENTES-------');
        this.storage.get("formsData").then((formsData) => {
            console.log(formsData);
            Object.keys(formsData).forEach((key, index) => {
                console.log(key, index);
                console.log(formsData[key]);
                for (let formData of formsData[key]){
                  console.log(formData);
                  let bugs = this.getValues(formData.data, 'error');
                  let empty_values = this.getValues(formData.data, 'value');
                  let bug_list = bugs.map(function (bug) {
                    if (bug != "")
                      return bug;
                  });
                  let empty_list = empty_values.map(function (value) {
                    if (value == "")
                      return value;
                  });
                  console.log("bugs",bugs);
                  console.log("vacíos",empty_values);

                  console.log("bugs_list", bug_list);
                  console.log("vacíos_list", empty_list);

                  formData["vacios"] = empty_list.length;
                  formData["errores"] = bug_list.length;

                  console.log("FORMDATA", formData);

                  this.formulariosPendientes.push(formData);
                }
            });
        });

        this.storage.forEach((value, key, index) => {
            console.log('key:', key);
            let keyValidador = new Date(key);
            if (keyValidador.getTime()) {
                console.log(value[value.length - 1].data);
                let errores = this.getValues(value[value.length - 1].data, 'error');
                let vacios = this.getValues(value[value.length - 1].data, 'value');
                let countError = 0;
                let countVacios = 0;
                for (let i = 0; i < errores.length; i++) {
                    if (errores[i] != '') {
                        countError = countError + 1;
                    }
                }
                for (let i = 0; i < vacios.length; i++) {
                    if (vacios[i] == '') {
                        countVacios = countVacios + 1;
                    }
                }
                value[value.length - 1].vacios = countVacios;
                value[value.length - 1].errores = countError;
                this.formulariosPendientes.push(value);
            }
        }).then(res => {
            console.log("------------Resultado For each PENDIENTES--------------");
            console.log(this.formulariosPendientes);
            console.log("--------------------------------------------");
            this.comprobandoPendientes = false;
        });
        this.events.subscribe('app:envioFormularios', (status) => {
            this.enviandoFormularios = status;
        });
    }

    clickEditarFormulario(form) {
        console.log(form);
        // this.events.publish('formulariosPendientes:editarFormulario', fechaFormulario);
    }

    clickEliminarFormulario(form) {
        console.log(form);
        // this.storage.remove(fechaFormulario).then(res => {
        //     let formularioVersiones = this.formulariosPendientes.splice(index, 1);
        // });
    }

    clickEnviarFormularios() {
        const confirm = this.alertCtrl.create({
            title: 'Seguro que quieres enviar tus formularios?',
            message: 'Al enviarlas ya no podras acceder a ellas',
            buttons: [
                {
                    text: 'Enviar',
                    handler: () => {
                        this.events.publish('formulariosPendientes:enviarFormularios');
                    }
                },
                {
                    text: 'Cancelar',
                    handler: () => {
                        console.log('Cancelar');
                    }
                }
            ]
        });
        confirm.present();
    }

    getObjects(obj, key, val) {
        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (typeof obj[i] == 'object') {
                objects = objects.concat(this.getObjects(obj[i], key, val));
                //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
            } else if (i == key && obj[i] == val || i == key && val == '') { //
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

    getValues(obj, key) {
        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (typeof obj[i] == 'object') {
                objects = objects.concat(this.getValues(obj[i], key));
            } else if (i == key) {
                objects.push(obj[i]);
            }
        }
        return objects;
    }
}
