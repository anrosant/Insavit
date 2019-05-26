import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { HistorialPage } from '../historial/historial';
import { FormularioPage } from '../formulario/formulario';

@Component({
  selector: 'page-formularios',
  templateUrl: 'formularios.html'
})
export class FormulariosPage {

  constructor(public navCtrl: NavController) {
  }
  goToHistorial(params){
    if (!params) params = {};
    this.navCtrl.push(HistorialPage);
  }goToFormulario(params){
    if (!params) params = {};
    this.navCtrl.push(FormularioPage);
  }
}
