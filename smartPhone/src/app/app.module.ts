import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';
import { SecureStorage, SecureStorageObject } from '@ionic-native/secure-storage';
import { DatePipe } from '@angular/common';
import { File } from '@ionic-native/file';
import { Geolocation } from '@ionic-native/geolocation';
import { HttpClientModule } from '@angular/common/http';
import { HTTP } from '@ionic-native/http';
import { Network } from '@ionic-native/network';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Diagnostic } from '@ionic-native/diagnostic';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
//import { HomePage2 } from '../pages/home2/home2';
import { HomeCVRPage } from '../pages/homeCVR/homeCVR';
import { Form } from '../pages/form/form';
import { AgregarFormularioPage } from '../pages/agregarFormulario/agregarFormulario';
import { modalEditarFormularioPage } from '../pages/modalEditarFormulario/modalEditarFormulario';
import { AuthPage } from '../pages/auth/auth';
//import { AuthCVRPage } from '../pages/authCVR/authCVR';
//import { LibretaPage } from '../pages/libreta/libreta';
//import { Libreta2Page } from '../pages/libreta2/libreta2';
import { LibretaCVRPage } from '../pages/libretaCVR/libretaCVR';
import { Libreta2CVRPage } from '../pages/libreta2CVR/libreta2CVR';
import { PerfilPage } from '../pages/perfil/perfil';
import { LibretasEnviadasPage } from '../pages/libretasEnviadas/libretasEnviadas';
import { misLibretasPage } from '../pages/misLibretas/misLibretas';
import { libretasPendientesPage } from '../pages/libretasPendientes/libretasPendientes';
import { IntelSecurity } from '@ionic-native/intel-security';
import { DatePicker } from '@ionic-native/date-picker';
import { LocalNotifications } from '@ionic-native/local-notifications';
//import { LongPressModule } from 'ionic-long-press';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    HomeCVRPage,
    Form,
    AgregarFormularioPage,
    modalEditarFormularioPage,
    AuthPage,
    PerfilPage,
    LibretasEnviadasPage,
    LibretaCVRPage,
    Libreta2CVRPage,
    misLibretasPage,
    libretasPendientesPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    HttpClientModule

    //LongPressModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    HomeCVRPage,
    Form,
    AgregarFormularioPage,
    modalEditarFormularioPage,
    AuthPage,
    PerfilPage,
    LibretasEnviadasPage,
    LibretaCVRPage,
    Libreta2CVRPage,
    misLibretasPage,
    libretasPendientesPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    HTTP,
    Network,
    SecureStorage,
    LocationAccuracy,
    Diagnostic,
    LocalNotifications,
    File,
    DatePipe,
    Geolocation,
    IntelSecurity,
    DatePicker,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})

export class AppModule {}
