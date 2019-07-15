import { Component } from '@angular/core';
import { NavController,NavParams, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'page-formulariosEnviados',
    templateUrl: 'formulariosEnviados.html'
})

export class FormulariosEnviadosPage {
    formulariosEnviados = null;
    keysFechasFormulariosEnviados;
    fechasFormulariosEnviados = {};
    arreglo = [];

    constructor(private events: Events, private datePipe: DatePipe, private storage:Storage,
                public navCtrl: NavController, public navParams:NavParams) {
        this.arreglo['f2'] = new Function("a", "b", "return a * b");
        this.arreglo['f3'] = function (a, b) {return a * b};
        this.arreglo['f4'] = function calcular(a, b) {return a * b};
        this.getFormulariosEnviados();
        this.events.subscribe('app:envioFormularios',(status) => {
            if(!status) {
                this.getFormulariosEnviados();
            }
        });
    }

    getFormulariosEnviados(){
        this.fechasFormulariosEnviados = [];
        this.formulariosEnviados = null;
        this.keysFechasFormulariosEnviados = [];
        this.storage.get('formulariosEnviados').then(res => {
            if(res) {
                this.formulariosEnviados = res;
                console.log(this.formulariosEnviados);
                for(let i = 0; i < this.formulariosEnviados.length; i++) {
                    let fecha = this.datePipe.transform(this.formulariosEnviados[i].fechaEnvio, "yyyy-MM-dd");
                    if(this.fechasFormulariosEnviados[fecha]) {
                        this.fechasFormulariosEnviados[fecha].push(this.formulariosEnviados[i].fechaFormulario);
                    } else {
                        this.fechasFormulariosEnviados[fecha] = [this.formulariosEnviados[i].fechaFormulario];
                    }
                }
                this.keysFechasFormulariosEnviados = Object.keys(this.fechasFormulariosEnviados);
                console.log(this.keysFechasFormulariosEnviados);
            }
        });
    }

    getArgs(func) {
        // First match everything inside the function argument parens.
        var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];
        // Split the arguments string into an array comma delimited.
        return args.split(',').map(function(arg) {
            // Ensure no inline comments are parsed and trim the whitespace.
            return arg.replace(/\/\*.*\*\//, '').trim();
        }).filter(function(arg) {
            // Ensure no undefined values are added.
            return arg;
        });
    }

    clickCollapseButton(index, collapseId, $event) {
        let buttonElement = $event.currentTarget;
        let element = document.getElementById(collapseId);
        if(element.getAttribute('class') == "collapse") {
            buttonElement.getElementsByTagName('ion-icon')[0].setAttribute('class','icon icon-md ion-md-arrow-dropdown item-icon');
        } else if(element.getAttribute('class') == "collapse show") {
            buttonElement.getElementsByTagName('ion-icon')[0].setAttribute('class','icon icon-md ion-md-arrow-dropright item-icon');
        }
    }
}
