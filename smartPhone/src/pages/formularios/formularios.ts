import { Component } from '@angular/core';
import { NavController, MenuController, Events ,ViewController,NavParams} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FormulariosEnviadosPage } from '../formulariosEnviados/formulariosEnviados';
import { formulariosPendientesPage } from '../formulariosPendientes/formulariosPendientes';
import { HttpClient } from '@angular/common/http';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Diagnostic } from '@ionic-native/diagnostic';

@Component({
    selector: 'page-formularios',
    templateUrl: 'formularios.html'
})

export class FormulariosPage {
    tabFormulariosEnviados = FormulariosEnviadosPage;
    tabFormulariosPendientes = formulariosPendientesPage;
    constructor(public navParams:NavParams, public viewCtrl: ViewController, private diagnostic: Diagnostic,
                private locationAccuracy: LocationAccuracy, public httpClient:HttpClient,
                private events: Events, public menuCtrl: MenuController, private storage: Storage,
                public navCtrl: NavController) {}
}
