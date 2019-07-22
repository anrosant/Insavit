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
import { SentFormsPage } from '../pages/sentForms/sentForms';
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
    sendingForms = false;
    urlServerEnvioFormulario = "http://150.136.230.16/api/send_form/";
    urlServerPlantilla = "http://150.136.230.16/api/templates/";
    urlServerCalculos = "http://150.136.230.16/api/validations/";

    constructor(private diagnostic: Diagnostic, private locationAccuracy: LocationAccuracy, public http: HTTP, public alertCtrl: AlertController, private geolocation: Geolocation, public loadingCtrl: LoadingController, public appCtrl: App, public httpClient: HttpClient, private storage: Storage, public menuCtrl: MenuController, private events: Events, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
        platform.ready().then(() => {
            this.events.subscribe('pendingForms:editarFormulario', (fechaFormulario) => {
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


            this.storage.get('linkedUser').then((val) => {
                this.params.linkedUser = val;
                if (val != null && val.sesion) {
                    this.selectItemMenuGeneral(this.listaGeneral[0], 0, null);
                }
                else {
                    this.appCtrl.getRootNav().setRoot(AuthPage);
                }

            });

            this.getTemplates();

            this.storage.get('calculos').then((calculos) => {
                if (calculos == null) {
                    this.httpClient.get('./assets/calculos/calculos.json').subscribe(res => {
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

    promesaEnvioFormulario(linkedUser, formulario) {
        return new Promise((resolve, reject) => {
            var data = {
                "formData": formulario,
                "user": linkedUser
            }
            this.httpClient.post(this.urlServerEnvioFormulario,
                data).subscribe(res => {
                    let responseJson = {
                        responseData: res["data"],
                        fechaEnvio: new Date(),
                        error: false
                    };
                    resolve(responseJson);
                }, err => {
                    console.log(err);
                    let responseJson = {
                        responseData: err,
                        fechaEnvio: null,
                        error: true
                    };
                    resolve(responseJson);
                });
        });
    }


    async enviarFormulariosEvent(pendingForms) {
        this.events.publish('app:envioFormularios', true);
        let formularios = [];
        let alert;
        let alert2;
        if (this.sendingForms == false) {
            alert = this.alertCtrl.create({
                title: "Enviando...",
                buttons: ["ok"]
            });
            alert.present();
            this.sendingForms = true;
            let linkedUser = await this.storage.get("linkedUser");
            let newPendingForms = pendingForms.slice();
            for (let pendingForm of newPendingForms) {
                let templateUuid = pendingForm.template;
                let index = pendingForm.index;
                let formData = pendingForm.formData;
                let result = await this.promesaEnvioFormulario(linkedUser, formData);
                if (result['error']) {
                    this.sendingForms = false;
                    if (alert) {
                        alert.dismiss();
                    }
                    alert2 = this.alertCtrl.create({
                        title: "Se detuvo el envio. Problemas de conexion con el servidor",
                        buttons: ["ok"]
                    });
                    alert2.present();
                    break;
                }
                else {
                    var formularioEnviado = {
                        sendDate: result["fechaEnvio"],
                        createdDate: result["responseData"]["createdDate"],
                        name: result["responseData"]["name"],
                        code: result["responseData"]["code"],
                        type: result["responseData"]["type"],
                    }
                    let sentForms = await this.storage.get("sentForms");
                    // Add sentForm
                    if (sentForms != null && sentForms.length > 0) {
                        sentForms.push(formularioEnviado);
                    }
                    else {
                        sentForms = [formularioEnviado];
                    }
                    await this.storage.set("sentForms", sentForms);
                    //Delete pendingForm
                    pendingForms.shift();
                    await this.storage.set("pendingForms", pendingForms);
                }
            }

            if (pendingForms.length == 0) {
                alert.dismiss();
                this.sendingForms = false;
                alert2 = this.alertCtrl.create({
                    message: "Todas las formularios han sido correctamente enviadas",
                    buttons: ["ok"]
                });
                alert2.present();
            }

            this.events.publish('app:envioFormularios', false);
        }
        else {
            if (alert2) {
                alert2.dismiss();
            }
            alert = this.alertCtrl.create({
                title: "Enviando",
                buttons: ["ok"]
            });
            alert.present();
        }
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

    }

    listenToLoginEvents() {
        this.events.subscribe('home:crearFormulario', (formularioTemporal) => {
            if (this.sendingForms) {
                let alert = this.alertCtrl.create({
                    title: "Eror",
                    subTitle: "No puedes crear una formulario mientras se estan enviando las formularios locales",
                    buttons: ["ok"]
                });;
                alert.present();
            }
            else {
                this.formularioTemporal = formularioTemporal;
            }

        });
        this.events.subscribe('home:editarFormulario', (formularioTemporal) => {
            if (this.sendingForms) {
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

        this.events.subscribe('pendingForms:enviarFormularios', (pendingForms) => {
            this.enviarFormulariosEvent(pendingForms);
        });


    }

    cerrarSesion() {
        this.storage.get('linkedUser').then((val) => {
            this.storage.set('linkedUser', val).then(data => {
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
