import { Component } from '@angular/core';
import { NavController,NavParams,Events } from 'ionic-angular';
import { HTTP } from '@ionic-native/http';
import { File } from '@ionic-native/file';


import {HttpClient} from '@angular/common/http';

import { catchError, map, tap } from 'rxjs/operators';

@Component({
  selector: 'page-libreta2',
  templateUrl: 'libreta2.html'
})
export class Libreta2Page {
data=[{
    label:"General",
    collapse:true,
    expanded:false,
    children:[{label:"Principal",icon:"home"},{label:"Perfil",icon:"person"},{label:"Libretas Enviadas",icon:"cloud-upload"}]
  },{
    label:"Genea",
    collapse:true,
    expanded:false,
    children:[{label:"Principal",icon:"home"},{label:"Perfil",icon:"person"},{label:"Libretas Enviadas",icon:"cloud-upload"}]
  },{
    label:"",
    collapse:false,
    expanded:null,
    children:[{label:"Principal",icon:"home"},{label:"Perfil",icon:"person"},{label:"Libretas Enviadas",icon:"cloud-upload"}]
  }];

  libretaTemporal;
  indexHorario;
  indexCategoria;
  indexSubCategoria;
  funciones=[];
  constructor(public events:Events,public httpClient:HttpClient,public file:File,public http:HTTP,public navCtrl: NavController, public navParams:NavParams) {
    console.log(this.navParams.data);
    this.libretaTemporal=this.navParams.data.libretaTemporal;
    this.indexHorario=this.navParams.data.indexHorario;
    this.indexCategoria=this.navParams.data.indexCategoria
    this.indexSubCategoria=this.navParams.data.indexSubCategoria;
    if (this.indexCategoria!=null) {
        console.log('con categoria');
       this.data=this.libretaTemporal.data[this.indexHorario].children[this.indexCategoria].children[this.indexSubCategoria];

    }
    else{
            console.log('sin categoria');
            this.data=this.libretaTemporal.data[this.indexHorario].children[this.indexSubCategoria];

    }
    this.httpClient.get('./assets/calculos/calculos.txt',{responseType: 'text'}).subscribe(calculos=>{
        console.log('(home) httpclient txt calculos');

        //let array=calculos.toString().split(/\n\s*\n\s*\n\s*\n/);
        let funcionesString=calculos.toString().split("<->");
        //console.log(array);
        //console.log(eval('var a;a='+array[1]).name);
        //console.log(eval("var a;a="+array[0])(4,5));

        for(let i=0;i<funcionesString.length;i++){
          this.funciones[eval('var a;a='+funcionesString[i]).name]=eval('var a;a='+funcionesString[i]);
        }

        //this.funciones[eval('var a;a='+funcionesString[1]).name]=eval('var a;a='+funcionesString[1]);
        console.log('(libreta2) funciones');
        console.log(this.funciones);


      },error=>{
        console.log('(home) error httpclient');
        console.log(JSON.stringify(error));
      });

  }


  mappingParametros(parameters){
    let parametrosMapeados=[];
   for(let i=0;i<parameters.length;i++){
      parametrosMapeados.push(this.getObjects(this.libretaTemporal,'id',parameters[i])[0]);
    }
    return parametrosMapeados;
  }

  //porque tengo que hacerlo asi porque se pierde la referncia si convierto el objeto a string entonces por eso mantengo un arreglo con el mapping de los argumentos.
  construirFuncionDinamicaString(stringFuncion,stringParametros,lengthParametros){
    let funcionString=stringFuncion+'(';
    for(let i=0;i<lengthParametros;i++){
      if (i==lengthParametros-1) {
         funcionString=`${funcionString}${stringParametros}[${i}])`;

      }
      else{
         funcionString=`${funcionString}${stringParametros}[${i}],`;

      }

    }
    return funcionString;
  }

  dinamicParameterFunctionString(funcionName,nombreParametros){
    let funcionString=funcionName+'(';
    for(let i=0;i<nombreParametros.length;i++){
      if (i==nombreParametros.length-1) {
         funcionString=funcionString+this.getObjects(this.libretaTemporal,'id',nombreParametros[i])[0]+')';

      }
      else{
         funcionString=funcionString+this.getObjects(this.libretaTemporal,'id',nombreParametros[i])[0]+',';

      }

    }
    return funcionString;
  }

  clickCollapseButton(index,id,$event){
    let buttonElement=$event.currentTarget;
    let collapse= document.getElementById(id);

    if (collapse.getAttribute('class')=="collapse") {
      buttonElement.getElementsByTagName('ion-icon')[0].setAttribute('class','icon icon-md ion-md-arrow-dropdown item-icon');
    }
    else if (collapse.getAttribute('class')=="collapse show") {
      buttonElement.getElementsByTagName('ion-icon')[0].setAttribute('class','icon icon-md ion-md-arrow-dropright item-icon');
    }
  }

  blur(index,item){
  }

  calcular(functionName){
    console.log("(libreta2) functionName:");
    console.log(functionName);
    let funcion=this.funciones[functionName];
    console.log("(libreta2) funcion:");
    console.log(funcion);
    let args=this.getArgs(funcion);
    let parametrosMapeados=this.mappingParametros(args);
    let stringFuncionMapeada=this.construirFuncionDinamicaString('funcion','parametrosMapeados',parametrosMapeados.length);
    console.log(eval(stringFuncionMapeada));
    console.log(this.libretaTemporal.data[this.indexHorario].children[this.indexCategoria].children[this.indexSubCategoria]);
  }


  getObjects(obj, key, val) {
      var objects = [];
      for (var i in obj) {
          if (!obj.hasOwnProperty(i)) continue;
          if (typeof obj[i] == 'object') {
              objects = objects.concat(this.getObjects(obj[i], key, val));
          } else
          //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
          if (i == key && obj[i] == val || i == key && val == '') { //
              objects.push(obj);
          } else if (obj[i] == val && key == ''){
              //only add if the object is not already in the array
              if (objects.lastIndexOf(obj) == -1){
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
}
