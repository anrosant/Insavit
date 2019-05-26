import { Component, ViewChild } from '@angular/core';
import { Platform,Events,MenuController,NavController,NavParams } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { SecureStorage, SecureStorageObject } from '@ionic-native/secure-storage';
import { SQLite } from '@ionic-native/sqlite';

import { FormulariosPage } from '../pages/formularios/formularios';
import { PerfilPage } from '../pages/perfil/perfil';
import { HomePage } from '../pages/home/home';


import { IngresoPage } from '../pages/ingreso/ingreso';
// import { FormsServiceProvider } from '../providers/forms-service/forms-service';
import { TasksService } from '../providers/tasks-service';

@Component({
  templateUrl: 'app.html'
})
export class INAMHIApp {
  @ViewChild('mainContent') navCtrl: NavController
  rootPage:any;
  flagMenu:boolean=false;
  params:any={usuarioViculado:null};

  constructor(
              public tasksService: TasksService,
              // public formService: FormsServiceProvider,
              private storage: Storage,
              private secureStorage: SecureStorage,
              public menuCtrl: MenuController,
              private events: Events,
              platform: Platform,
              statusBar: StatusBar,
              splashScreen: SplashScreen,
              public sqlite: SQLite) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      this.listenToLoginEvents();
      this.createDatabase();
      this.storage.get('usuarioVinculado').then((val) => {
        // console.log('main (comprobando existencia de usuario vinculado):',JSON.stringify(val));
        this.params.usuarioVinculado=val;
        if (val!=null && val.sesion) {
          this.rootPage=FormulariosPage;
        }
        else{
          this.rootPage=FormulariosPage;
        }

      }).catch(error =>{
        console.error(error);
      });

    });
  }

  private createDatabase(){
    this.sqlite.create({
      name: 'data.db',
      location: 'default' // the location field is required
    })
    .then((db) => {
      this.tasksService.setDatabase(db);
      return this.tasksService.createTable();
    })
    // .then(() =>{
    //   return this.storage.get('usuarioVinculado');
    // })
    // .then((val) => {
    //   // console.log('main (comprobando existencia de usuario vinculado):',JSON.stringify(val));
    //   this.params.usuarioVinculado=val;
    //   if (val!=null && val.sesion) {
    //     this.rootPage=FormulariosPage;
    //   }
    //   else{
    //     this.rootPage=IngresoPage;
    //   }
    //
    // })
    .catch(error =>{
      console.error(error);
    });
  }




  listenToLoginEvents(){
    this.events.subscribe('habilitarMenu',()=>{
      this.menuCtrl.enable(true);
    });
    this.events.subscribe('desabilidarMenu',()=>{
      // this.menuCtrl.enable(false);
    });


  }

  cerrarSesion(){
    // this.rootPage=IngresoPage;
    this.navCtrl.setRoot(IngresoPage);
    this.events.publish('cerrarSesionMenu', {});
  }


  // @ViewChild(Nav) navCtrl: Nav;
  //   rootPage:any = IngresoPage;
  //
  // constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
  //   platform.ready().then(() => {
  //     // Okay, so the platform is ready and our plugins are available.
  //     // Here you can do any higher level native things you might need.
  //     statusBar.styleDefault();
  //     statusBar.show();
  //     splashScreen.hide();
  //   });
  // }
  goToPerfil(params){
    if (!params) params = this.params.usuarioVinculado;
    this.navCtrl.push(PerfilPage);
  }
  goToPruebas(params){
    if (!params) params = {};
    this.navCtrl.push(HomePage);
  }

  vacio(params){
    if (!params) params = {};
    console.log(".");
  }
}
