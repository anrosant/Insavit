import { Component } from '@angular/core';
import { NavController, MenuController, Events, AlertController, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AuthPage } from '../auth/auth';
import { DatePipe } from '@angular/common';

import { HttpClient } from '@angular/common/http';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Form } from '../form/form'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  libretasEnviadas;
  templates = null;

  constructor(private diagnostic: Diagnostic,
    private events: Events,
    public menuCtrl: MenuController,
    private storage: Storage,
    public navCtrl: NavController) {

    this.menuCtrl.enable(true);

    this.storage.get('libretasEnviadas').then((libretasEnviadas) => {
      this.libretasEnviadas = libretasEnviadas;
    });

    this.storage.get('templates').then((templates) => {
      this.templates = templates;
    });
  }

  startForm(template) {
    this.navCtrl.push(Form, { template: template, selectedForm: template.data });
  }

}
