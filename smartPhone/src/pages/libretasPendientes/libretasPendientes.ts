import { Component,ViewChild} from '@angular/core';
import { NavController,NavParams, Events,AlertController} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DatePipe } from '@angular/common';
import { HomeCVRPage } from '../homeCVR/homeCVR'
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'page-libretasPendientes',
    templateUrl: 'libretasPendientes.html'
})

export class libretasPendientesPage {
    @ViewChild(HomeCVRPage) home: HomeCVRPage;
    libretasPendientes = [];
    comprobandoPendientes = true;
    enviandoLibretas = false;

    constructor(public alertCtrl:AlertController, public httpClient:HttpClient, private events: Events,
                private datePipe: DatePipe, private storage:Storage, public navCtrl: NavController,
                public navParams:NavParams) {
        this.getLibretasPendientes();
        this.events.subscribe('app:envioLibretas',(status) => {
            if(!status) {
                this.getLibretasPendientes();
            }
        });
        console.log(navCtrl.getViews());
    }

    getLibretasPendientes() {
        this.libretasPendientes = [];
        console.log('-----fOR EACH PENDIENTES-------');
        this.storage.forEach((value,key,index) => {
            console.log('key:',key);
            let keyValidador = new Date(key);
            if(keyValidador.getTime()) {
                console.log('aki');
                console.log(value[value.length - 1].data);
                let errores = this.getValues(value[value.length-1].data,'error');
                let vacios = this.getValues(value[value.length-1].data,'value');
                let countError = 0;
                let countVacios = 0;
                console.log(vacios);
                for(let i = 0; i < errores.length; i++) {
                    if(errores[i] != '') {
                        countError = countError + 1;
                    }
                }
                for(let i = 0; i < vacios.length; i++) {
                    if(vacios[i] == '') {
                      countVacios = countVacios + 1;
                    }
                }
                value[value.length - 1].vacios = countVacios;
                value[value.length - 1].errores = countError;
                //console.log(value);
                this.libretasPendientes.push(value);
            }
        }).then(res => {
            console.log("------------Resultado For each PENDIENTES--------------");
            console.log(this.libretasPendientes);
            console.log("--------------------------------------------");
            this.comprobandoPendientes = false;
        });
        this.events.subscribe('app:envioLibretas',(status) => {
            this.enviandoLibretas = status;
        });
    }

    clickEditarLibreta(fechaLibreta){
        console.log(fechaLibreta);
        this.events.publish('libretasPendientes:editarLibreta', fechaLibreta);
    }

    clickEliminarLibreta(fechaLibreta, index) {
        console.log(fechaLibreta);
        console.log(index);
        this.storage.remove(fechaLibreta).then(res => {
            let libretaVersiones = this.libretasPendientes.splice(index, 1);
        });
    }

    clickEnviarLibretas() {
        const confirm = this.alertCtrl.create({
            title: 'Seguro que quieres enviar tus libretas?',
            message: 'Al enviarlas ya no podras acceder a ellas',
            buttons: [
                {
                    text: 'Enviar',
                    handler:() => {
                        this.events.publish('libretasPendientes:enviarLibretas');
                    }
                },
                {
                    text: 'Cancelar',
                    handler:() => {
                        console.log('Cancelar');
                    }
                }
            ]
        });
        confirm.present();
    }

    getObjects(obj, key, val) {
        var objects = [];
        for(var i in obj) {
            if(!obj.hasOwnProperty(i)) continue;
            if(typeof obj[i] == 'object') {
                objects = objects.concat(this.getObjects(obj[i], key, val));
            //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
            } else if(i == key && obj[i] == val || i == key && val == '') { //
                objects.push(obj);
            } else if(obj[i] == val && key == '') {
                //only add if the object is not already in the array
                if(objects.lastIndexOf(obj) == -1) {
                    objects.push(obj);
                }
            }
        }
        return objects;
    }

    getValues(obj, key) {
        var objects = [];
        for(var i in obj) {
            if(!obj.hasOwnProperty(i)) continue;
            if(typeof obj[i] == 'object') {
                objects = objects.concat(this.getValues(obj[i], key));
            } else if(i == key) {
                objects.push(obj[i]);
            }
        }
        return objects;
    }
}
