import { Component } from '@angular/core';
import { NavController , NavParams, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-perfil',
  templateUrl: 'perfil.html'
})
export class PerfilPage {

  datosUsuario : null;

  constructor(private storage: Storage, public navCtrl: NavController,public navParams:NavParams, public alertCtrl: AlertController) {

    // Or to get a key/value pair
    // this.menuCtrl.enable(false);
    // //this.usuarioVinculado=this.navParams.get('usuarioVinculado');
    // console.log('(auth) params constructor', JSON.stringify(this.navParams.data));
    // const alertador = this.alertCtrl.create({
    //   title: 'Credenciales In!',
    //   subTitle: JSON.stringify(this.navParams),
    //   buttons: ['OK']
    // });
    // alertador.present();


    this.storage.get('usuarioVinculado').then((val) => {
        if (val) {
          this.datosUsuario=val.data;
          console.log('usuarioVinculado',JSON.stringify(this.datosUsuario));
          const alertador = this.alertCtrl.create({
            title: 'Credenciales Correctas!',
            subTitle: JSON.stringify(this.datosUsuario),
            buttons: ['OK']
          });
          alertador.present();
        }else{
          console.log('(auth) final then get storage vinculado');
          const alertador = this.alertCtrl.create({
            title: 'Credenciales In!',
            subTitle: JSON.stringify(val),
            buttons: ['OK']
          });
          alertador.present();
        }

      });
  }

}
