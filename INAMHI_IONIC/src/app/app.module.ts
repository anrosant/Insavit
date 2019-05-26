import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { INAMHIApp } from './app.component';


import { IngresoPage } from '../pages/ingreso/ingreso';
import { FormulariosPage } from '../pages/formularios/formularios';
import { HistorialPage } from '../pages/historial/historial';
import { FormularioPage } from '../pages/formulario/formulario';
import { PerfilPage } from '../pages/perfil/perfil';
import { HomePage } from '../pages/home/home';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SecureStorage, SecureStorageObject } from '@ionic-native/secure-storage';
import { HTTP } from '@ionic-native/http';
import { Network } from '@ionic-native/network';
import { SQLite } from '@ionic-native/sqlite';
import { TasksService } from '../providers/tasks-service';
// import { FormsServiceProvider } from '../providers/forms-service/forms-service';



@NgModule({
  declarations: [
    INAMHIApp,
    IngresoPage,
    FormulariosPage,
    HistorialPage,
    FormularioPage,
    PerfilPage,
    HomePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(INAMHIApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    INAMHIApp,
    IngresoPage,
    FormulariosPage,
    HistorialPage,
    FormularioPage,
    PerfilPage,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    HTTP,
    Network,
    SecureStorage,
    DatePipe,
    SQLite,
    TasksService,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    // FormsServiceProvider
  ]
})
export class AppModule {}
