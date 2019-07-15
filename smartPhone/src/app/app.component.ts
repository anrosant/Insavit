import { Component } from '@angular/core';
import { Platform, Events, MenuController, NavController, App, LoadingController, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { AuthPage } from '../pages/auth/auth';
//import { AuthCVRPage } from '../pages/authCVR/authCVR';
import { HomePage } from '../pages/home/home';
//import {HomePage2} from '../pages/home2/home2';
import { PerfilPage } from '../pages/perfil/perfil';
import { FormulariosEnviadosPage } from '../pages/formulariosEnviados/formulariosEnviados';
import { FormulariosPage } from '../pages/formularios/formularios';
import { HTTP } from '@ionic-native/http';
import { HttpClient } from '@angular/common/http';
import { Coordinates, Geolocation } from '@ionic-native/geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Diagnostic } from '@ionic-native/diagnostic';
import { FormPage } from '../pages/form/form';
import { FollowUpPage } from '../pages/followUp/followUp';

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage: any;
    flagMenu: boolean = false;
    params: any = { usuarioViculado: null };
    fechaIncioApp = new Date();
    listaGeneral = [{ page: HomePage, icon: "ios-home-outline", label: "Principal" }, { page: PerfilPage, icon: "ios-person-outline", label: "Perfil" }, { page: FormulariosPage, icon: "ios-paper-outline", label: "Formularios" }];
    indexSelectedGeneral = 0;
    indexSelectedFormulario = null;
    plantillaApp;
    formularioTemporal;
    rootParams;

    observacionPage;
    fenomenosPage;
    enviandoFormularios = false;
    messageFormularioEnviada = "Enviando...";


    FormulariosEnviar1 = [];
    FormulariosEnviar2 = {};
    // urlServerEnvioFormulario="http://ec2-13-58-239-128.us-east-2.compute.amazonaws.com/formularios";
    urlServerEnvioFormulario = "http://150.136.230.16/api/send_form/";
    // urlServerPlantilla="http://150.136.230.16/api/templates/";
    // urlServerCalculos="http://150.136.230.16/api/validations/";
    urlServerPlantilla = "http://192.168.0.10:8000/prueba/plantilla";
    urlServerCalculos = "http://192.168.0.10:8000/prueba/calculos";

    constructor(private diagnostic: Diagnostic, private locationAccuracy: LocationAccuracy, public http: HTTP, public alertCtrl: AlertController, private geolocation: Geolocation, public loadingCtrl: LoadingController, public appCtrl: App, public httpClient: HttpClient, private storage: Storage, public menuCtrl: MenuController, private events: Events, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            this.events.subscribe('formulariosPendientes:editarFormulario', (fechaFormulario) => {
                this.selectItemMenuGeneral(this.listaGeneral[0], 0, null);
                this.appCtrl.getRootNav().setRoot(HomePage, { fechaFormulario: fechaFormulario });

            });
            window.addEventListener('beforeunload', () => {
                setTimeout(() => {
                    console.log('setime oout cerrando');
                }, 3000);
            });

            statusBar.styleDefault();
            splashScreen.hide();
            this.listenToLoginEvents();

            this.storage.get('fechaInstalacion').then(data => {
                if (data == null) {
                    this.storage.set('fechaInstalacion', this.fechaIncioApp);
                }
            });
            this.getPlantillaApp();

            this.storage.forEach((value, key, index) => {
                let keyValidador = new Date(key);

                if (keyValidador.getTime()) {
                    this.FormulariosEnviar1.push(value);
                    this.FormulariosEnviar2[key] = value;
                }


            }).then(res => {
                console.log(this.FormulariosEnviar1);
                console.log(this.FormulariosEnviar2);
            });


            this.storage.get('usuarioVinculado').then((val) => {
                this.params.usuarioVinculado = val;
                if (val != null && val.sesion) {
                    this.selectItemMenuGeneral(this.listaGeneral[0], 0, null);
                }
                else {
                    this.appCtrl.getRootNav().setRoot(AuthPage);
                }

            }).catch(error => {
                console.log('main (hubo error en catch en check existencia de usuario vinculado)', error);

            });

            this.getTemplates();

            this.storage.get('calculos').then((calculos) => {
                if (calculos == null) {
                    this.httpClient.get('./assets/calculos/calculos.json').subscribe(res => {
                        console.log('seteando calculos');
                        console.log(res);
                        this.storage.set('calculos', res);
                    }, err => {
                        console.log('error no puede conectarse al servidor para descarga de calculos', err);
                    });

                } else {
                    console.log('si hay calculos'); console.log(calculos);
                }
            });

        });

    }

    getTemplates() {
        setInterval(() => {
            this.httpClient.get(this.urlServerPlantilla).subscribe(res => {
                this.storage.set('templates', res);
            }, err => {
                console.log('error no puede conectarse al servidor para descarga de plantilla');
            });
            this.httpClient.get(this.urlServerCalculos).subscribe(res => {
                this.storage.set('calculos', res);
            }, err => {
                console.log('error no puede conectarse al servidor para descarga de calculos');
            });
        }, 3000);

        this.storage.get('templates').then((templates) => {
            if (templates == null) {
                this.httpClient.get('./assets/plantilla/templates.json').subscribe(res => {
                    this.storage.set('templates', res);
                }, err => {
                    console.log('error no puede conectarse al servidor para descarga de plantilla');
                });

            } else {
                console.log('si hay plantilla'); console.log(templates);
            }
        });
    }

    promesaEnvioFormulario(formulario) {
        return new Promise((resolve, reject) => {
            for (let l of formulario) {
                this.httpClient.post(this.urlServerEnvioFormulario, l).subscribe(res => {
                    let responseJson = { responseData: res, fechaEnvio: new Date(), error: false };
                    resolve(responseJson);
                }, err => {
                    console.log(err);
                    let responseJson = { responseData: err, fechaEnvio: null, error: true };
                    resolve(responseJson);
                });
            }

        });
    }


    async envioFormularios2() {
        this.events.publish('app:envioFormularios', true);
        let formularios = [];
        let alert;
        let alert2;
        if (this.enviandoFormularios == false) {
            this.messageFormularioEnviada = "Enviando...";
            alert = this.alertCtrl.create({
                title: "Enviando",
                buttons: ["ok"]
            });;
            alert.present();
            this.enviandoFormularios = true;
            let keys = await this.storage.keys();
            for (let i = 0; i < keys.length; i++) {
                let keyValidador = new Date(keys[i]);
                if (keyValidador.getTime()) {
                    let formulario = await this.storage.get(keys[i]);
                    let result = await this.promesaEnvioFormulario(formulario);
                    if (result['error']) {
                        this.enviandoFormularios = false;
                        if (alert) {
                            alert.dismiss();
                        }
                        alert2 = this.alertCtrl.create({
                            title: "Se detuvo el envio. Problemas de conexion con el servidor",
                            buttons: ["ok"]
                        });;
                        alert2.present();
                        break;
                    }
                    else {
                        console.log('borrando en storage');
                        await this.storage.remove(keys[i]);
                        let lenviadas = await this.storage.get('formulariosEnviados');
                        if (lenviadas) {
                            lenviadas.push({ fechaEnvio: result["fechaEnvio"], fechaFormulario: keys[i] });
                        }
                        else {
                            lenviadas = [{ fechaEnvio: result["fechaEnvio"], fechaFormulario: keys[i] }];
                        }
                        await this.storage.set('formulariosEnviados', lenviadas);

                    }
                }
                if (i == keys.length - 1) {
                    this.enviandoFormularios = false;
                    if (alert) {
                        alert.dismiss();
                    }

                    alert2 = this.alertCtrl.create({
                        title: "Todas las formularios han sido correctamente enviadas",
                        buttons: ["ok"]
                    });;
                    alert2.present();
                }
            }
        } else {
            if (alert2) {
                alert2.dismiss();
            }
            alert = this.alertCtrl.create({
                title: "Enviando",
                buttons: ["ok"]
            });;
            alert.present();
        }

        this.events.publish('app:envioFormularios', false);
    }

    selectItemMenuGeneral(item, index, $event) {

        this.indexSelectedFormulario = null;
        this.indexSelectedGeneral = index;
        this.menuCtrl.close();
        this.appCtrl.getRootNav().setRoot(item.page);
    }

    selectItemMenuFormulario(index, page) {
        this.indexSelectedGeneral = null;
        this.indexSelectedFormulario = index;
        this.menuCtrl.close();

        this.rootParams = {
            indexHorario: index,
            formularioTemporal: this.formularioTemporal,
        }

        this.appCtrl.getRootNav().setRoot(page, this.rootParams);

        console.log('(app) rootparams');
        console.log(this.rootParams);

    }

    listenToLoginEvents() {
        this.events.subscribe('home:crearFormulario', (formularioTemporal) => {
            if (this.enviandoFormularios) {
                let alert = this.alertCtrl.create({
                    title: "Eror",
                    subTitle: "No puedes crear una formulario mientras se estan enviando las formularios locales",
                    buttons: ["ok"]
                });;
                alert.present();
            }
            else {
                console.log('(app) formulario temporal event');
                this.formularioTemporal = formularioTemporal;
            }

        });
        this.events.subscribe('home:editarFormulario', (formularioTemporal) => {
            if (this.enviandoFormularios) {
                let alert = this.alertCtrl.create({
                    title: "Enviando",
                    subTitle: "No puedes editar una formulario mientras se estan enviando las formularios locales",
                    buttons: ["ok"]
                });;
                alert.present();
            }
            else {
                this.formularioTemporal = formularioTemporal;
            }
        });

        this.events.subscribe('formulariosPendientes:enviarFormularios', () => {
            this.envioFormularios2();
        });


    }

    cerrarSesion() {
        this.storage.get('usuarioVinculado').then((val) => {
            this.storage.set('usuarioVinculado', val).then(data => {
                this.indexSelectedGeneral = 0;
                this.appCtrl.getRootNav().setRoot(AuthPage);

            });
        });
    }

    getPlantillaApp() {
        this.httpClient.get('./assets/plantilla/templates.json').subscribe(templates => {
            this.plantillaApp = templates[0];
        }, error => {
            this.plantillaApp = null;
        });
    }
}
