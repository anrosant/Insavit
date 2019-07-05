import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ViewController, Events, MenuController, App } from 'ionic-angular';
import { HTTP } from '@ionic-native/http';
import { Network } from '@ionic-native/network';
import { HomeCVRPage } from '../homeCVR/homeCVR';
import { HomePage } from '../home/home';
import { Storage } from '@ionic/storage';
import { SecureStorage, SecureStorageObject } from '@ionic-native/secure-storage';
import { Md5 } from 'ts-md5/dist/md5';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IntelSecurity } from '@ionic-native/intel-security';

@Component({
    selector: 'page-auth',
    templateUrl: 'auth.html'
})

export class AuthPage {

    user = { username: "", password: "" };
    url = "http://150.136.230.16/api/validate_user/";
    usuarioVinculado;

    constructor(private intelSecurity: IntelSecurity,
        public httpClient: HttpClient, public appCtrl: App,
        public menuCtrl: MenuController, private secureStorage: SecureStorage,
        private storage: Storage, public navCtrl: NavController,
        public navParams: NavParams, public http: HTTP,
        public network: Network, public loadingCtrl: LoadingController,
        public alertCtrl: AlertController) {
        // Or to get a key/value pair
        this.menuCtrl.enable(false);
        console.log('(auth) params constructor', JSON.stringify(this.navParams.data));
        this.storage.get('usuarioVinculado').then((val) => {
            if (val) {
                this.usuarioVinculado = val;
                console.log('usuarioVinculado', JSON.stringify(this.usuarioVinculado));
            }
        });
    }
    
    attemptAuth() {
        const loader = this.loadingCtrl.create({
            content: "Espere ...",
        });
        loader.present();
        if (this.usuarioVinculado) {
            this.intelSecurity.storage.read({ id: 'usuarioClave' })
                .then((instanceID: number) => this.intelSecurity.data.getData(instanceID))
                .then((data: string) => {
                    console.log(data);
                    if (this.user.password == data) {
                        loader.dismiss();
                        const alertador = this.alertCtrl.create({
                            title: 'Credenciales Correctas!',
                            subTitle: 'Has ingresado correctamente',
                            buttons: ['OK']
                        });
                        alertador.present();
                        this.usuarioVinculado.sesion = true;
                        this.storage.set('usuarioVinculado', this.usuarioVinculado).then(data => {
                            this.appCtrl.getRootNav().setRoot(HomePage);
                        });
                    }
                    else {
                        loader.dismiss();
                        const alert = this.alertCtrl.create({
                            title: 'Credenciales incorrectas!',
                            subTitle: 'Intentelo de nuevo',
                            buttons: ['OK']
                        });
                        alert.present();

                    }
                }) // Resolves to 'Sample Data'
                .catch((error: any) => console.log(error));
        }
        else {
            this.http.post(this.url, { username: this.user.username, password: this.user.password }, {})
                .then(res => {
                    const alert = this.alertCtrl.create({
                        subTitle: JSON.parse(res.data).msg,
                        buttons: ['OK']
                    });
                    alert.present();
                    if (JSON.parse(res.data).userId != undefined) {
                        this.intelSecurity.data.createFromData({ data: this.user.password })
                            .then((instanceID: Number) => {
                                this.intelSecurity.storage.write({ id: "usuarioClave", instanceID: instanceID }).then(res => { console.log('exito en guardar en storage intel') });
                                this.storage.set('usuarioVinculado', { usuario: this.user.username, sesion: true, uid: JSON.parse(res.data).uid })
                                    .then((data) => {
                                        loader.dismiss();
                                        console.log('se vinculo el usuario y se guardo la informacion del servidor', data);
                                        this.appCtrl.getRootNav().setRoot(HomePage);
                                    })
                                    .catch(error => {
                                        loader.dismiss();
                                        console.log('error de guardado storage', error);
                                    });

                            })
                            .catch((error: any) => {
                                console.log(error);
                            });
                    }
                    else {
                        loader.dismiss();
                    }
                })
                .catch(error => {
                    loader.dismiss();
                    if (error.status == 403) {
                        const alert = this.alertCtrl.create({
                            subTitle: 'Hubo un problema de conexión. Intentelo más tarde',
                            buttons: ['OK']
                        });
                        alert.present();
                    }
                    else {
                        const alert = this.alertCtrl.create({
                            title: 'No hay Conexion a Internet',
                            subTitle: 'Solo puedes iniciar sesion sin internet con una cuenta registrada. Inicia sesion con internet y automaticamente se registrara tu cuenta.',
                            buttons: ['OK']
                        });
                        alert.present();
                    }
                });
        }
    }
    desvincular() {
        const confirm = this.alertCtrl.create({
            title: 'Seguro que quieres ingresar con otra cuenta?',
            message: 'Se borrara la cuenta registrada y podras registrarte de nuevo cuando inicies sesion con internet',
            buttons: [
                {
                    text: 'Iniciar con otra cuenta',
                    handler: () => {
                        console.log('Desvincular clicked');
                        this.storage.clear().then(() => {
                            this.httpClient.get('./assets/plantilla/plantilla.json').subscribe(res => {
                                this.storage.set('plantilla', res);
                            }, err => {
                                console.log('error no puede conectarse al servidor para descarga de plantilla');
                                console.log(err);
                            });
                            this.httpClient.get('./assets/calculos/calculos.json', { responseType: 'text' }).subscribe(res => {
                                console.log('seteando calculos');
                                console.log(res);
                                this.storage.set('calculos', res);
                            }, err => {
                                console.log('error no puede conectarse al servidor para descarga de plantilla');
                                console.log(err);
                            });
                            this.usuarioVinculado = null;
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
