import { Component } from '@angular/core';
import { NavController,NavParams,Events,AlertController } from 'ionic-angular';
import { HTTP } from '@ionic-native/http';
import { File } from '@ionic-native/file';
import { Storage } from '@ionic/storage';
import {HttpClient} from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

@Component({
    selector: 'page-libreta2CVR',
    templateUrl: 'libreta2CVR.html'
})

export class Libreta2CVRPage {
    libretaVersiones;
    libretaTemporal;
    seccionSelected;
    seccionSelected2;
    funciones = [];
    constructor(public alertCtrl:AlertController, private storage: Storage, public events:Events,
                public httpClient:HttpClient, public file:File, public http:HTTP, public navCtrl: NavController,
                public navParams:NavParams) {
        console.log(this.navParams.data);
        this.libretaTemporal = this.navParams.data.libretaTemporal;
        this.libretaVersiones = this.navParams.data.libretaVersiones;
        this.seccionSelected = this.navParams.data.seccionSelected;
        this.seccionSelected2 = this.navParams.data.seccionSelected2;
        this.storage.get('calculos').then((calculos) => {
            console.log('(home) httpclient txt calculos');
            //let array = calculos.toString().split(/\n\s*\n\s*\n\s*\n/);
            let funcionesString = calculos.toString().split("<->");
            console.log(funcionesString);
            //console.log(array);
            //console.log(eval('var a;a='+array[1]).name);
            //console.log(eval("var a;a="+array[0])(4,5));

            for(let i = 0; i < funcionesString.length; i++) {
                this.funciones[eval('var a;a='+funcionesString[i]).name] = eval('var a;a='+funcionesString[i]);
            }

            //this.funciones[eval('var a;a='+funcionesString[1]).name]=eval('var a;a='+funcionesString[1]);
            console.log('(libreta2) funciones');
            console.log(this.funciones);
            /*
            let funcionx=this.funciones["prueba2"];
            let args=this.getArgs(this.funciones['prueba2']);
            let parametros=[this.getObjects(this.libretaTemporal,'id',args[0])[0],222];
            let parametrosMapeados=this.mappingParametros(args);
            let stringFuncion=this.construirFuncionDinamicaString('funcionx','parametrosMapeados',parametrosMapeados.length);
            //let parametros=[this.getObjects(this.libretaTemporal,'id',args[0])[0],222];
            console.log(parametrosMapeados);
            console.log(stringFuncion);
            console.log(eval(stringFuncion));
            //let argumento=this.getObjects(this.libretaTemporal,'id',args[0])[0];
            //argumento.value='25';
            //let funcionString=this.dinamicParameterFunctionString(this.funciones['prueba2'],args);
            //console.log(eval(this.dinamicParameterFunctionString('funcionx',args)));
            */
        }).catch(error => {
            console.log('(home) error get calculos');
            console.log(JSON.stringify(error));
        });
    }

    mappingParametros(parameters) {
        let parametrosMapeados = [];
        for(let i = 0; i < parameters.length; i++){
            parametrosMapeados.push(this.getObjects(this.libretaTemporal, 'id', parameters[i])[0]);
        }
        return parametrosMapeados;
    }

    //porque tengo que hacerlo asi porque se pierde la referncia si convierto el objeto a string entonces por eso mantengo un arreglo con el mapping de los argumentos.
    construirFuncionDinamicaString(stringFuncion, stringParametros, lengthParametros) {
        let funcionString = stringFuncion + '(';
        for(let i = 0; i < lengthParametros; i++) {
            if(i == lengthParametros - 1) {
                funcionString = `${funcionString}${stringParametros}[${i}])`;
            } else {
                funcionString = `${funcionString}${stringParametros}[${i}],`;
            }
        }
        return funcionString;
    }

    dinamicParameterFunctionString(funcionName, nombreParametros) {
        let funcionString = funcionName + '(';
        for(let i = 0; i < nombreParametros.length; i++) {
            if(i == nombreParametros.length - 1) {
                funcionString = funcionString+this.getObjects(this.libretaTemporal,'id',nombreParametros[i])[0]+')';
            } else {
                funcionString = funcionString+this.getObjects(this.libretaTemporal,'id',nombreParametros[i])[0]+',';
            }
        }
        return funcionString;
    }

    clickCollapseButton(index,id,$event){
        let buttonElement = $event.currentTarget;
        let collapse = document.getElementById(id);
        if(collapse.getAttribute('class') == "collapse") {
            buttonElement.getElementsByTagName('ion-icon')[0].setAttribute('class','icon icon-md ion-md-arrow-dropdown item-icon');
        } else if(collapse.getAttribute('class') == "collapse show") {
            buttonElement.getElementsByTagName('ion-icon')[0].setAttribute('class','icon icon-md ion-md-arrow-dropright item-icon');
        }
    }

    triggerFunction(functionName) {
        try{
            console.log("(libreta2) functionName:");
            console.log(functionName);
            let funcion = this.funciones[functionName];
            console.log("(libreta2) funcion:");
            console.log(funcion);
            let args = this.getArgs(funcion);
            console.log('argumentos');
            console.log(args);
            console.log(this.libretaTemporal);
            let parametrosMapeados = this.mappingParametros(args);
            /*
            if (!parametrosMapeados[parametrosMapeados.length-1]) {
            parametrosMapeados[parametrosMapeados.length-1]=element;
            }
            */
            console.log('parametrosMapeados');
            console.log(parametrosMapeados);
            let stringFuncionMapeada = this.construirFuncionDinamicaString('funcion','parametrosMapeados',parametrosMapeados.length);
            console.log(stringFuncionMapeada);
            eval(stringFuncionMapeada);
            console.log('paso');
        } catch(err) {
            let alert = this.alertCtrl.create({
                title: "Error",
                subTitle:"La funcion de calculo tiene un error interno",
                buttons: ["ok"]
            });
            alert.present();
            console.log('*****Mensaje de error trigger Calculo*******');
            console.log(err.message);
        }
    }

    getObjects(obj, key, val) {
        var objects = [];
        for(var i in obj) {
            if(!obj.hasOwnProperty(i)) continue;
            if(typeof obj[i] == 'object') {
                objects = objects.concat(this.getObjects(obj[i], key, val));
            //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
            } else if(i == key && obj[i] == val || i == key && val == '') { //
                objects.push(obj);
            } else if(obj[i] == val && key == '') {
                //only add if the object is not already in the array
                if(objects.lastIndexOf(obj) == -1) {
                    objects.push(obj);
                }
            }
        }
        return objects;
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

    save() {
        console.log('Guardando');
        this.libretaTemporal.fechaGuardado = new Date();
        if(this.libretaTemporal.version == 0) {
            this.storage.set(this.libretaTemporal.fechaLibreta,[this.libretaTemporal]);
        } else {
            let copia = this.libretaVersiones.slice(0);
            copia.push(this.libretaTemporal);
            this.storage.set(this.libretaTemporal.fechaLibreta, copia);
        }
    }

    keyupFunction($event, functionName) {
        console.log('keyup', functionName);
        var element = $event.currentTarget;
        if(functionName) {
            this.triggerFunction(functionName);
        }
        this.save();
    }

    blurFunction($event, functionName) {
        console.log('blur', functionName);
        if(functionName) {
            this.triggerFunction(functionName);
        }
        this.save();
    }

    clickFunction($event, functionName) {
        console.log('click',functionName);
        var element = $event.currentTarget;
        if(functionName) {
            this.triggerFunction(functionName);
        }
        this.save();
    }
}
