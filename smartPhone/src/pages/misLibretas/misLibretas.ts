import { Component } from '@angular/core';
import { NavController, MenuController, Events ,ViewController,NavParams} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { LibretasEnviadasPage } from '../libretasEnviadas/libretasEnviadas';
import { libretasPendientesPage } from '../libretasPendientes/libretasPendientes';
import { HttpClient } from '@angular/common/http';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Diagnostic } from '@ionic-native/diagnostic';

@Component({
    selector: 'page-misLibretas',
    templateUrl: 'misLibretas.html'
})

export class misLibretasPage {
    tabLibretasEnviadas = LibretasEnviadasPage;
    tabLibretasPendientes = libretasPendientesPage;
    constructor(public navParams:NavParams, public viewCtrl: ViewController, private diagnostic: Diagnostic,
                private locationAccuracy: LocationAccuracy, public httpClient:HttpClient,
                private events: Events, public menuCtrl: MenuController, private storage: Storage,
                public navCtrl: NavController) {}
}
