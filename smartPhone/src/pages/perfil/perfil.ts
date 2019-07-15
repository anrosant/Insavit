import { Component } from '@angular/core';
import { FormulariosEnviadosPage } from '../formulariosEnviados/formulariosEnviados';
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
    formulariosEnviados;
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
        // Or to get a key/value pair
        // this.menuCtrl.enable(false);
        // //this.usuarioVinculado=this.navParams.get('usuarioVinculado');
        // console.log('(auth) params constructor', JSON.stringify(this.navParams.data));
        // const alertador = this.alertCtrl.create({
        //    title: 'Credenciales In!',
        //    subTitle: JSON.stringify(this.navParams),
        //    buttons: ['OK']
        // });
        // alertador.present();

        this.storage.get('usuarioVinculado').then((val) => {
            if(val) {
                this.usuario = val
                console.log('usuarioVinculado', JSON.stringify(this.datosUsuario));
            } else {
                console.log('(auth) final then get storage vinculado');
            }
        });

        this.storage.get('formulariosEnviados').then((val) => {
            this.formulariosEnviados = val;
            console.log(val);
        });

        this.storage.get('fechaInstalacion').then(data => {
            console.log('(app) fecha get storage', JSON.stringify(data));
            this.fechaInstalacion = data;
        });
    }

    ionViewDidEnter() {}
}
