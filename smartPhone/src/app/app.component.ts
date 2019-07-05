import { Component } from '@angular/core';
import { Platform, Events, MenuController, NavController, App, LoadingController, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { AuthPage } from '../pages/auth/auth';
//import { AuthCVRPage } from '../pages/authCVR/authCVR';
import {HomePage} from '../pages/home/home';
//import {HomePage2} from '../pages/home2/home2';
import {HomeCVRPage} from '../pages/homeCVR/homeCVR';
import {PerfilPage} from '../pages/perfil/perfil';
import {LibretasEnviadasPage} from '../pages/libretasEnviadas/libretasEnviadas';
import {LibretaCVRPage} from '../pages/libretaCVR/libretaCVR';
import {Libreta2CVRPage} from '../pages/libreta2CVR/libreta2CVR';
import {misLibretasPage} from '../pages/misLibretas/misLibretas';
import { HTTP } from '@ionic-native/http';
import {HttpClient} from '@angular/common/http';
import { Coordinates,Geolocation } from '@ionic-native/geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Form } from '../pages/form/form';

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any;
  flagMenu: boolean = false;
  params: any = { usuarioViculado: null };
  fechaIncioApp = new Date();
  listaGeneral = [{ page: HomePage, icon: "ios-home-outline", label: "Principal" }, { page: HomeCVRPage, icon: "ios-home-outline", label: "Principal" }, { page: PerfilPage, icon: "ios-person-outline", label: "Perfil" }, { page: misLibretasPage, icon: "ios-paper-outline", label: "Mis Libretas" }];
  indexSelectedGeneral = 0;
  indexSelectedLibreta = null;
  plantillaApp;
  libretaTemporal;
  rootParams;

  observacionPage;
  fenomenosPage;
  enviandoLibretas = false;
  messageLibretaEnviada = "Enviando...";


  LibretasEnviar1 = [];
  LibretasEnviar2 = {};
  // urlServerEnvioLibreta="http://ec2-13-58-239-128.us-east-2.compute.amazonaws.com/formularios";
  urlServerEnvioLibreta = "http://150.136.230.16/api/send_form/";
  // urlServerPlantilla="http://150.136.230.16/api/templates/";
  // urlServerCalculos="http://150.136.230.16/api/validations/";
  urlServerPlantilla = "http://192.168.0.10:8000/prueba/plantilla";
  urlServerCalculos = "http://192.168.0.10:8000/prueba/calculos";

  constructor(private diagnostic: Diagnostic, private locationAccuracy: LocationAccuracy, public http: HTTP, public alertCtrl: AlertController, private geolocation: Geolocation, public loadingCtrl: LoadingController, public appCtrl: App, public httpClient: HttpClient, private storage: Storage, public menuCtrl: MenuController, private events: Events, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.events.subscribe('libretasPendientes:editarLibreta', (fechaLibreta) => {
        this.selectItemMenuGeneral(this.listaGeneral[0], 0, null);
        this.appCtrl.getRootNav().setRoot(HomeCVRPage, { fechaLibreta: fechaLibreta });

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
          this.LibretasEnviar1.push(value);
          this.LibretasEnviar2[key] = value;
        }


      }).then(res => {
        console.log(this.LibretasEnviar1);
        console.log(this.LibretasEnviar2);
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
            console.log(res);
            this.storage.set('templates', res);
          }, err => {
            console.log('error no puede conectarse al servidor para descarga de plantilla');
          });

        } else {
          console.log('si hay plantilla'); console.log(templates);
        }
      });

      this.storage.get('templates').then((templates) => {
        if (templates == null) {
          console.log(templates);
          this.httpClient.get('./assets/plantilla/templates.json').subscribe(res => {
            console.log(res);
            this.storage.set('templates', res);
          }, err => {
            console.log('error no puede conectarse al servidor para descarga de plantilla');
            console.log(err);
          });
        } else {
          console.log('si hay plantilla'); console.log(templates);
        }
      });

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

  promesaEnvioLibreta(libreta) {
    return new Promise((resolve, reject) => {
      for (let l of libreta) {
        this.httpClient.post(this.urlServerEnvioLibreta, l).subscribe(res => {
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


  async envioLibretas2() {
    this.events.publish('app:envioLibretas', true);
    let libretas = [];
    let alert;
    let alert2;
    if (this.enviandoLibretas == false) {
      this.messageLibretaEnviada = "Enviando...";
      alert = this.alertCtrl.create({
        title: "Enviando",
        buttons: ["ok"]
      });;
      alert.present();
      this.enviandoLibretas = true;
      let keys = await this.storage.keys();
      for (let i = 0; i < keys.length; i++) {
        let keyValidador = new Date(keys[i]);
        if (keyValidador.getTime()) {
          let libreta = await this.storage.get(keys[i]);
          let result = await this.promesaEnvioLibreta(libreta);
          if (result['error']) {
            this.enviandoLibretas = false;
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
            let lenviadas = await this.storage.get('libretasEnviadas');
            if (lenviadas) {
              lenviadas.push({ fechaEnvio: result["fechaEnvio"], fechaLibreta: keys[i] });
            }
            else {
              lenviadas = [{ fechaEnvio: result["fechaEnvio"], fechaLibreta: keys[i] }];
            }
            await this.storage.set('libretasEnviadas', lenviadas);

          }
        }
        if (i == keys.length - 1) {
          this.enviandoLibretas = false;
          if (alert) {
            alert.dismiss();
          }

          alert2 = this.alertCtrl.create({
            title: "Todas las libretas han sido correctamente enviadas",
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

    this.events.publish('app:envioLibretas', false);
  }

  selectItemMenuGeneral(item, index, $event) {

    this.indexSelectedLibreta = null;
    this.indexSelectedGeneral = index;
    this.menuCtrl.close();
    this.appCtrl.getRootNav().setRoot(item.page);
  }

  selectItemMenuLibreta(index, page) {
    this.indexSelectedGeneral = null;
    this.indexSelectedLibreta = index;
    this.menuCtrl.close();

    this.rootParams = {
      indexHorario: index,
      libretaTemporal: this.libretaTemporal,
    }

    this.appCtrl.getRootNav().setRoot(page, this.rootParams);

    console.log('(app) rootparams');
    console.log(this.rootParams);

  }

  listenToLoginEvents() {
    this.events.subscribe('home:crearLibreta', (libretaTemporal) => {
      if (this.enviandoLibretas) {
        let alert = this.alertCtrl.create({
          title: "Eror",
          subTitle: "No puedes crear una libreta mientras se estan enviando las libretas locales",
          buttons: ["ok"]
        });;
        alert.present();
      }
      else {
        console.log('(app) libreta temporal event');
        this.libretaTemporal = libretaTemporal;
      }

    });
    this.events.subscribe('home:editarLibreta', (libretaTemporal) => {
      if (this.enviandoLibretas) {
        let alert = this.alertCtrl.create({
          title: "Enviando",
          subTitle: "No puedes editar una libreta mientras se estan enviando las libretas locales",
          buttons: ["ok"]
        });;
        alert.present();
      }
      else {
        this.libretaTemporal = libretaTemporal;
      }
    });

    this.events.subscribe('libretasPendientes:enviarLibretas', () => {
      this.envioLibretas2();
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
