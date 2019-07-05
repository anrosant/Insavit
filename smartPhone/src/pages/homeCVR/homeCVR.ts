import { Component } from '@angular/core';
import { Platform, NavController, MenuController, Events, LoadingController, AlertController, NavParams, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AuthPage } from '../auth/auth';
import { DatePipe } from '@angular/common';
import { LibretaCVRPage } from '../libretaCVR/libretaCVR';
import { HttpClient } from '@angular/common/http';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Coordinates, Geolocation } from '@ionic-native/geolocation';
import { DatePicker } from '@ionic-native/date-picker';
import { LocalNotifications } from '@ionic-native/local-notifications';

@Component({
    selector: 'page-homeCVR',
    templateUrl: 'homeCVR.html'
})

export class HomeCVRPage {
    fechaMinima;
    fechaMaxima = "2020-12-12";
    fechaLibreta;
    libretasEnviadas;
    keysStorage;
    creacionLibreta = false;
    edicionLibreta = false;
    comprobandoLibreta = false;
    messageButton = "Selecciona una fecha de libreta";
    libretaVersiones = null;
    libreta = null;
    seccionSelected = null;
    ubicacionSelected;
    plantillaApp = null;
    motivo = null;
    permisoGeolocalizacion = "GRANTED";
    statusEnviandoLibretas = false;
    usuario = null;

    constructor(private localNotifications: LocalNotifications,
        private datePicker: DatePicker,
        private toastCtrl: ToastController, public navparams: NavParams,
        public loadingCtrl: LoadingController,
        platform: Platform, public alertCtrl: AlertController,
        private geolocation: Geolocation,
        private diagnostic: Diagnostic,
        private locationAccuracy: LocationAccuracy,
        public httpClient: HttpClient, private events: Events,
        private datePipe: DatePipe,
        public menuCtrl: MenuController, private storage: Storage,
        public navCtrl: NavController) {

        this.menuCtrl.enable(true);
        this.storage.get('fechaInstalacion').then(data => {
            console.log('(home) fecha get storage', JSON.stringify(data));
            console.log('(home) pipe fecha', this.datePipe.transform(data, "yyyy-MM-dd"));
            this.fechaMinima = this.datePipe.transform(data, "yyyy-MM-dd");
            if (this.navparams.data.fechaLibreta) {
                this.fechaLibreta = this.navparams.data.fechaLibreta;
                this.changeDate(this.fechaLibreta);
            }
        });
        platform.ready().then(() => {
            this.localNotifications.on('trigger').subscribe(res => {
                let msg = res.text;
                let alert = this.alertCtrl.create({
                    title: res.title,
                    subTitle: msg
                });
                alert.present()
            });
        });
        this.storage.keys().then((keys) => {
            console.log('keys storage');
            console.log(keys);
            this.keysStorage = keys;
        });
        this.storage.get('libretasEnviadas').then((libretasEnviadas) => {
            console.log(libretasEnviadas);
            this.libretasEnviadas = libretasEnviadas;
        });
        this.storage.get('usuarioVinculado').then((val) => {
            if (val != null && val.sesion) {
                this.usuario = { username: val.usuario, uid: val.uid };
            }
        }).catch(error => {
            console.log('main (hubo error en catch en check existencia de usuario vinculado)', error);
        });
        platform.resume.subscribe(() => {
            console.log('resume platform');
            // do something
            this.diagnostic.getLocationAuthorizationStatus().then(res => {
                this.permisoGeolocalizacion = res;
            }).catch(err => {
                console.log(JSON.stringify(err));
            });
        });
        this.events.subscribe('app:envioLibretas', (status) => {
            if (this.fechaLibreta) {
                this.changeDate(this.fechaLibreta);
            }
            this.statusEnviandoLibretas = status;
        });
    }

    schedudelNotification() {
        this.localNotifications.schedule({
            title: 'Encuesta - Parámetros siguientes',
            text: 'Tienes que realizar el cuestionario en la sección ABC',
            trigger: { at: new Date(new Date().getTime() + 3600) },
            led: 'FF0000',
            sound: null
        });
    }

    ionViewDidEnter() {
        this.events.subscribe('app:editarLibreta', (fechaLibreta) => {
            this.fechaLibreta = fechaLibreta;
            console.log(fechaLibreta);
            //this.changeDate(this.fechaLibreta);
        });
        if (this.fechaLibreta) this.changeDate(this.fechaLibreta);
        this.diagnostic.requestLocationAuthorization().then(res => {
            this.permisoGeolocalizacion = res;
        }).catch(err => {
            console.log(JSON.stringify(err));
        });
    }

    crearLibreta() {
        if (this.statusEnviandoLibretas) {
            const alert = this.alertCtrl.create({
                title: 'Error',
                message: `No puedes Crear o Editar Libretas mientras se estan enviando`,
                buttons: ["ok"]
            });
            alert.present();
        } else {
            if (this.permisoGeolocalizacion == "GRANTED") {
                console.log(this.ubicacionSelected);
                if (this.ubicacionSelected == true) {
                    const loader = this.loadingCtrl.create({
                        content: `<ion-label> Espere...</ion-label>
                        <div class="custom-spinner-container">
                        <div class="custom-spinner-box"></div>
                        </div>
                        `,
                    });
                    loader.present();
                    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
                        if (canRequest) {
                            // the accuracy option will be ignored by iOS
                            this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(() => {
                                console.log('Request successful');
                                this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 12000 }).then((res) => {
                                    loader.dismiss();
                                    let fecha = new Date();
                                    this.libreta.fechaCreacion = (this.libretaVersiones != null ? this.libreta.fechaCreacion : fecha);
                                    this.libreta.fechaAcceso = fecha;
                                    this.libreta.fechaGuardado = null;
                                    this.libreta.coordenadas = { latitude: res.coords.latitude, longitude: res.coords.longitude };
                                    this.libreta.gps = this.ubicacionSelected;
                                    this.libreta.motivo = this.motivo;
                                    this.libreta.usuario = this.usuario,
                                        this.libreta.version = (this.libretaVersiones != null ? this.libretaVersiones[this.libretaVersiones.length - 1].version + 1 : 0);
                                    this.navCtrl.push(LibretaCVRPage, { libretaVersiones: this.libretaVersiones, seccionSelected: this.seccionSelected, libretaTemporal: this.libreta });
                                    //alert(distancia);
                                }).catch((error) => {
                                    loader.dismiss();
                                    const alert = this.alertCtrl.create({
                                        title: 'Error al capturar tus coordenadas. Asegurate que tu posicion sea estable ',
                                        message: JSON.stringify(error),
                                        buttons: ["ok"]
                                    });
                                    alert.present();
                                    console.log('Error getting locatio', JSON.stringify(error));
                                });
                            }, error => {
                                loader.dismiss();
                                console.log('Error requesting location permissions', error);
                                const alert = this.alertCtrl.create({
                                    title: 'Error',
                                    message: `No has seleccionado alguna opcion de ubicacion`,
                                    buttons: ["ok"]
                                });
                                alert.present();
                            }).catch(err => {
                                const alert = this.alertCtrl.create({
                                    title: 'Error location acurracy 2222',
                                    message: JSON.stringify(Error),
                                    buttons: ["ok"]
                                });
                                alert.present();
                            });
                        } else {
                            console.log('no puedes preguntar por location accuracy');
                        }
                    }).catch(err => {
                        const alert = this.alertCtrl.create({
                            title: 'Error location acurracy',
                            message: JSON.stringify(err),
                            buttons: ["ok"]
                        });
                        alert.present();
                    });
                } else if (this.ubicacionSelected == false) {
                    let fecha = new Date();
                    this.libreta.fechaCreacion = (this.libretaVersiones != null ? this.libreta.fechaCreacion : fecha);
                    this.libreta.fechaAcceso = fecha;
                    this.libreta.fechaGuardado = null;
                    this.libreta.coordenadas = null;
                    this.libreta.gps = this.ubicacionSelected;
                    this.libreta.motivo = this.motivo;
                    this.libreta.usuario = this.usuario,
                        this.libreta.version = (this.libretaVersiones != null ? this.libretaVersiones[this.libretaVersiones.length - 1].version + 1 : 0);
                    this.navCtrl.push(LibretaCVRPage, { libretaVersiones: this.libretaVersiones, seccionSelected: this.seccionSelected, libretaTemporal: this.libreta });
                } else {
                    const alert = this.alertCtrl.create({
                        title: 'Error',
                        message: `No has seleccionado alguna opcion de ubicacion`,
                        buttons: ["ok"]
                    });
                    alert.present();
                }
            } else {
                const alert = this.alertCtrl.create({
                    title: 'Error',
                    message: `No puedes acceder a esta funcionalidad sin antes haber concedido los permisos de ubicacion`,
                    buttons: ["ok"]
                });
                alert.present();
            }
        }
    }

    public async changeDate(fechaLibreta) {
        this.creacionLibreta = false;
        this.ubicacionSelected = null;
        this.edicionLibreta = false;
        this.motivo = null;
        if (!fechaLibreta) {
            this.libreta = null;
            this.comprobandoLibreta = false;
            this.messageButton = "Selecciona una fecha de libreta";
            this.libretaVersiones = null;
        } else {
            this.comprobandoLibreta = true;
            this.messageButton = "Espere...";
            let libretaVersiones = await this.storage.get(fechaLibreta);
            this.libretaVersiones = libretaVersiones;
            let plantillaApp = await this.storage.get('templates')[0];
            this.libreta = ((libretaVersiones) ? JSON.parse(JSON.stringify(libretaVersiones[libretaVersiones.length - 1])) : { fechaLibreta: this.fechaLibreta, codigoPlantilla: plantillaApp.codigo, data: plantillaApp.data });
            this.seccionSelected = this.libreta.data[0];
            let libretasEnviadas = await this.storage.get('libretasEnviadas');
            let libretasFechasEnviadas: any = await this.promesaGetFechasEnviadas(libretasEnviadas);
            //this.schedudelNotification();
            if (libretaVersiones != null && !libretasFechasEnviadas.includes(fechaLibreta)) {
                this.creacionLibreta = false;
                this.edicionLibreta = true;
                this.messageButton = "Editar Libreta";
            } else if (libretaVersiones == null && !libretasFechasEnviadas.includes(fechaLibreta)) {
                this.creacionLibreta = true;
                this.edicionLibreta = false;
                this.messageButton = "Crear Libreta";
            } else if (libretaVersiones == null && libretasFechasEnviadas.includes(fechaLibreta)) {
                this.messageButton = "Libreta enviada, no puedes acceder";
            }
            this.comprobandoLibreta = false;
        }
    }

    promesaGetFechasEnviadas(libretasEnviadas) {
        return new Promise(resolve => {
            console.log(libretasEnviadas);
            let listaFechasLibretasEnviadas = [];
            if (!libretasEnviadas) {
                libretasEnviadas = [];
            }
            for (let i = 0; i < libretasEnviadas.length; i++) {
                listaFechasLibretasEnviadas.push(libretasEnviadas[i].fechaLibreta);
            }
            console.log(listaFechasLibretasEnviadas);
            resolve(listaFechasLibretasEnviadas);
        });
    }

    compareFn(e1, e2): boolean {
        return e1 && e2 ? e1.label === e2.label : e1 === e2;
    }

    switchToSettings() {
        this.diagnostic.switchToSettings().then(res => {
            console.log(JSON.stringify(res));
        });
    }

    requestLocationAuthorization() {
        this.diagnostic.requestLocationAuthorization().then(res => {
            console.log('REQUEST LOCATION AUTORIZATIONff');
            console.log(JSON.stringify(res));
            this.permisoGeolocalizacion = res;
        }).catch(err => {
            console.log(JSON.stringify(err));
        });
    }

    changeUbicacion() {
        console.log(this.ubicacionSelected);
        if (this.ubicacionSelected == true) {
            this.motivo = null;
        } else if (this.ubicacionSelected == false) {
            if (!(this.creacionLibreta == false && this.edicionLibreta == false)) {
                let alert = this.alertCtrl.create({
                    title: 'Motivo',
                    inputs: [
                        {
                            name: 'motivo',
                            value: this.motivo,
                            placeholder: 'Ingresa un motivo'
                        }
                    ],
                    buttons: [
                        {
                            text: 'Cancelar',
                            role: 'cancel',
                            handler: data => {
                                console.log('Cancel clicked');
                                this.motivo = null;
                                this.ubicacionSelected = null;
                            }
                        },
                        {
                            text: 'Guardar',
                            handler: data => {
                                this.motivo = data.motivo;
                            }
                        }
                    ]
                });
                alert.present();
            }
        }
    }

    clickDatePicker() {
        let element: HTMLElement = document.getElementById('inputDate') as HTMLElement;
        element.click();
    }
}
