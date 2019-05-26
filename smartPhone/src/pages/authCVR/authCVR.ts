import { Component } from '@angular/core';
import { NavController,NavParams,LoadingController,AlertController, ViewController ,Events, MenuController, App} from 'ionic-angular';
import { HTTP } from '@ionic-native/http';
import { Network } from '@ionic-native/network';
import {HomeCVRPage} from '../homeCVR/homeCVR';
import { Storage } from '@ionic/storage';
import { SecureStorage, SecureStorageObject } from '@ionic-native/secure-storage';
import {Md5} from 'ts-md5/dist/md5';
import {HttpClient,HttpParams} from '@angular/common/http';


@Component({
  selector: 'page-authCVR',
  templateUrl: 'authCVR.html'
})
export class AuthCVRPage {

	form={username:"",password:""};
	temp={username:"rdsua",password:"123"};
  //url="http://192.168.0.9:8000/auth";
  url="http://ec2-13-58-239-128.us-east-2.compute.amazonaws.com:3100/ingreso/login";
  usuarioVinculado;

  constructor(public httpClient:HttpClient,public appCtrl:App,public menuCtrl: MenuController,private secureStorage: SecureStorage,private storage: Storage, public navCtrl: NavController, public navParams:NavParams,public http:HTTP,public network:Network,public loadingCtrl:LoadingController, public alertCtrl: AlertController) {

    // Or to get a key/value pair
    this.menuCtrl.enable(false);
    //this.usuarioVinculado=this.navParams.get('usuarioVinculado');
    console.log('(auth) params constructor', JSON.stringify(this.navParams.data));
    this.storage.get('usuarioVinculado').then((val) => {
      if (val) {
        this.usuarioVinculado=val;
        console.log('usuarioVinculado',JSON.stringify(this.usuarioVinculado));
      }
          console.log('(auth) final then get storage vinculado');

    });
  }

  attemptAuth() { 
    const loader = this.loadingCtrl.create({
      content: "Espere ...",
    });
    loader.present();

    let params = new HttpParams().set('usuario', this.form.username).set('clave',Md5.hashStr(this.form.password).toString());
    this.httpClient.get(this.url,{params:params}).subscribe(
        res=>{
          console.log(res);

          
          
        },
        err=>{
          if (err.status==0) {//no hay conexion
            if (this.usuarioVinculado) {

            }else{
               const alert = this.alertCtrl.create({
                title: 'No hay Conexion a Internet',
                subTitle: 'Solo puedes iniciar sesion sin internet con una cuenta registrada. Inicia sesion con internet y automaticamente se registrara tu cuenta.',
                buttons: ['OK']
              });
              alert.present();

            }
            
            
          }else if(err.status==403){// autenticacion fallida en el servidor
            const alert = this.alertCtrl.create({
              title: 'Error al autenticar',
              subTitle: 'Las credenciales que has ingresado son incorrectas',
              buttons: ['OK']
            });
            alert.present();

          }
          
        }

      );


    if (this.usuarioVinculado) {
      console.log('attemptloginVinculado');
      /*
      if (this.form.password==this.usuarioVinculado.clave) {
        loader.dismiss();
        const alertador = this.alertCtrl.create({
          title: 'Credenciales Correctas!',
          subTitle: 'Has ingresado correctamente',
          buttons: ['OK']
        });
        alertador.present();
        this.navCtrl.setRoot(HomePage);

      }
      else{
        loader.dismiss();
        const alert = this.alertCtrl.create({
          title: 'Credenciales incorrectas!',
          subTitle: 'Intentelo de nuevo',
          buttons: ['OK']
        });
        alert.present();
      }
      */
      
      this.secureStorage.create('security')
      .then((storage: SecureStorageObject) => {
         storage.get('usuarioClave')
           .then(
             data => {
               console.log("get2 secure passwordd",data);
               if (Md5.hashStr(this.form.password).toString()==data) {
                 loader.dismiss();
                  const alertador = this.alertCtrl.create({
                    title: 'Credenciales Correctas!',
                    subTitle: 'Has ingresado correctamente',
                    buttons: ['OK']
                  });
                  alertador.present();
                  this.usuarioVinculado.sesion=true;
                  this.storage.set('usuarioVinculado',this.usuarioVinculado).then(data=>{
                    console.log('(auth) set usuarioVinculado')
                    //this.navCtrl.setRoot(HomeCVRPage);
                    this.appCtrl.getRootNav().setRoot(HomeCVRPage);
                  });
               }
               else{
                 loader.dismiss();
                  const alert = this.alertCtrl.create({
                    title: 'Credenciales incorrectas!',
                    subTitle: 'Intentelo de nuevo',
                    buttons: ['OK']
                  });
                  alert.present();

               }
             },
             error => console.log(error)
         );
      });
      

    }
    else{
      console.log('attemptloginNOvinculado');
      
      this.http.get(this.url, {usuario:this.form.username,clave:Md5.hashStr(this.form.password)}, {})
      .then(data => {
        loader.dismiss();
        const alertador = this.alertCtrl.create({
          title: 'Credenciales Correctas!',
          subTitle: 'Has ingresado correctamente',
          buttons: ['OK']
        });
        alertador.present();

        this.secureStorage.create('security')
        .then((storage: SecureStorageObject) => {
           let claveMd5:string=Md5.hashStr(this.form.password).toString();
           storage.set('usuarioClave',claveMd5)
             .then(
                result => {
                  console.log("auth (set1 secure passwords):",result);
                  console.log(JSON.stringify(data));
                  this.storage.set('usuarioVinculado', {usuario:this.form.username,sesion:true,data:JSON.parse(data.data)[0]})
                  .then((data)=>{
                    console.log('se vinculo el usuario y se guardo la informacion del servidor',data);
                     this.appCtrl.getRootNav().setRoot(HomeCVRPage);
                    //this.navCtrl.setRoot(HomeCVRPage);
                  })
                  .catch(error=>{
                    console.log('error de guardado storage',error)
                  });
                },
                 error => console.log('este es un error',JSON.stringify(error))
             );
        });    
        
      })
      .catch(error => {
        loader.dismiss();
        if (error.status == 403) {
            const alert = this.alertCtrl.create({
              title: 'Credenciales incorrectas!',
              subTitle: 'Intentelo de nuevo',
              buttons: ['OK']
            });
            alert.present();
        }
        else{
          const alert = this.alertCtrl.create({
              title: 'No hay Conexion a Internet',
              subTitle: 'Solo puedes iniciar sesion sin internet con una cuenta registrada. Inicia sesion con internet y automaticamente se registrara tu cuenta.',
              buttons: ['OK']
            });
            alert.present();
        }

        console.log(error.status);
        console.log(error.error); // error message as string
        console.log(error.headers);

      });

    }
    
    

  }
  desvincular(){
    const confirm = this.alertCtrl.create({
      title: 'Seguro que quieres ingresar con otra cuenta?',
      message: 'Se borrara la cuenta registrada y podras registrarte de nuevo cuando inicies sesion con internet',
      buttons: [
        {
          text: 'Iniciar con otra cuenta',
          handler: () => {
            console.log('Desvincular clicked');
            this.storage.clear().then(()=>{
              this.usuarioVinculado=null;
              this.secureStorage.create('security')
              .then((storage: SecureStorageObject) => {
                storage.clear();
              });

            });
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

}
