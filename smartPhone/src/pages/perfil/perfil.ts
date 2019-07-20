import { Component } from '@angular/core';
import { SentFormsPage } from '../sentForms/sentForms';
import { Coordinates,Geolocation } from '@ionic-native/geolocation';
import { NavController , NavParams, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Component({
    selector: 'page-perfil',
    templateUrl: 'perfil.html'
})

export class PerfilPage {
    position;
    datosUsuario : null;
    sentForms;
    fechaInstalacion;
    usuario = {
        usuario:'cbenitez',
        session:true,
        data:
            {
                "codigo_estacion":"M0123",
                "id_estacion":63765,
                "latitud":"-1.133889",
                "longitud":"-79.075556",
                "altura":"1471.00",
                "provincia":"COTOPAXI",
                "canton":"PANGUA",
                "parroquia":"EL CORAZON",
                "usuario":"juan",
                "rol":"Formularios principales"
             }
    };

    constructor(private geolocation: Geolocation, private storage: Storage, public navCtrl: NavController,
                public navParams:NavParams, public alertCtrl: AlertController) {
        this.storage.get('linkedUser').then((val) => {
            if(val) {
                this.usuario = val
            } else {
                console.log('(auth) final then get storage vinculado');
            }
        });

        this.storage.get('sentForms').then((val) => {
            this.sentForms = val;
            console.log(val);
        });

        this.storage.get('fechaInstalacion').then(data => {
            console.log('(app) fecha get storage', JSON.stringify(data));
            this.fechaInstalacion = data;
        });
    }

    ionViewDidEnter() {}
}
