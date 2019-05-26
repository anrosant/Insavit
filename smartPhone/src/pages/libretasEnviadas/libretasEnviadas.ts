import { Component } from '@angular/core';
import { NavController,NavParams, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DatePipe } from '@angular/common';



@Component({
  selector: 'page-libretasEnviadas',
  templateUrl: 'libretasEnviadas.html'
})
export class LibretasEnviadasPage {
	libretasEnviadas=null;
  keysFechasLibretasEnviadas;
  fechasLibretasEnviadas={};
  arreglo=[];



  constructor(private events: Events,private datePipe: DatePipe,private storage:Storage,public navCtrl: NavController, public navParams:NavParams) {

  	//eval("function prueba(){alert('soy una prueba')}");
    this.arreglo['f2']=new Function("a", "b", "return a * b");
    this.arreglo['f3']=function (a, b) {return a * b};
    this.arreglo['f4']=function calcular(a, b) {return a * b};

    this.getLibretasEnviadas();

    this.events.subscribe('app:envioLibretas',(status)=>{
        if (!status) {
          this.getLibretasEnviadas();
        }
     });

  }



  getLibretasEnviadas(){
    this.fechasLibretasEnviadas=[];
    this.libretasEnviadas=null;
    this.keysFechasLibretasEnviadas=[];
    this.storage.get('libretasEnviadas').then(res=>{
      if (res) {
        this.libretasEnviadas=res;
        console.log(this.libretasEnviadas);
        for(let i=0;i<this.libretasEnviadas.length;i++){
          console.log('entreeeeee');
          let fecha=this.datePipe.transform(this.libretasEnviadas[i].fechaEnvio,"yyyy-MM-dd");
          console.log(fecha);
          if (this.fechasLibretasEnviadas[fecha]) {
            this.fechasLibretasEnviadas[fecha].push(this.libretasEnviadas[i].fechaLibreta);
          }
          else{
            this.fechasLibretasEnviadas[fecha]=[this.libretasEnviadas[i].fechaLibreta];
          }
        }
        this.keysFechasLibretasEnviadas=Object.keys(this.fechasLibretasEnviadas);
        console.log(this.keysFechasLibretasEnviadas);
        
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
  pruebax(nombreFuncion,p1,p2){
      //function
      console.log(document.getElementById('idPrueba'));
      console.log(this.getArgs(this.arreglo[nombreFuncion]));
      console.log(this.fechasLibretasEnviadas);
      console.log(Object.keys(this.fechasLibretasEnviadas));
  }

  ionViewDidEnter(){
  	console.log('libretasenviadaspage');
  	console.log(this.navCtrl.getViews());
  	console.log(this.navCtrl.last());

  }


  clickCollapseButton(index,collapseId,$event){
    let buttonElement=$event.currentTarget;
    let element= document.getElementById(collapseId);
    if (element.getAttribute('class')=="collapse") {
      console.log('class colapse');
      buttonElement.getElementsByTagName('ion-icon')[0].setAttribute('class','icon icon-md ion-md-arrow-dropdown item-icon');
      console.log(buttonElement.getElementsByTagName('ion-icon')[0]);
    }
    else if (element.getAttribute('class')=="collapse show") {
      console.log('class colapse show');
      console.log(index);
       buttonElement.getElementsByTagName('ion-icon')[0].setAttribute('class','icon icon-md ion-md-arrow-dropright item-icon');
       console.log(buttonElement.getElementsByTagName('ion-icon')[0]);
    }
  }

}
