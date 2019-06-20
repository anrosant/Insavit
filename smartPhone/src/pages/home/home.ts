import { Component } from '@angular/core';
import { NavController, MenuController, Events, AlertController, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SecureStorage, SecureStorageObject } from '@ionic-native/secure-storage';
import {AuthPage} from '../auth/auth';
import { DatePipe } from '@angular/common';
import { LibretaPage } from '../libreta/libreta';

import {HttpClient} from '@angular/common/http';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Diagnostic } from '@ionic-native/diagnostic';



@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  fechaMinima;
  fechaMaxima="2020-12-12";
  fechaLibreta;
  libretasEnviadas;
  keysStorage;
  creacionLibreta=false;
  edicionLibreta=false;
  comprobandoLibreta=false;
  messageButton="Selecciona una fecha de libreta";
  prueba;

  constructor(private diagnostic: Diagnostic,private locationAccuracy: LocationAccuracy,public httpClient:HttpClient,private events: Events,private datePipe: DatePipe,public menuCtrl: MenuController,private secureStorage: SecureStorage,private storage: Storage,public navCtrl: NavController) {
    this.menuCtrl.enable(true);
    this.storage.get('fechaInstalacion').then(data=>{
        this.fechaMinima=this.datePipe.transform(data,"yyyy-MM-dd");
     });

    this.storage.keys().then((keys)=>{
      this.keysStorage=keys;
    });
    this.storage.get('libretasEnviadas').then((libretasEnviadas)=>{
      this.libretasEnviadas=libretasEnviadas;
    });

  }
  ionViewDidEnter(){

    this.storage.get('usuarioVinculado').then((val) => {
      console.log('(home) get storage usuarioVinculado',JSON.stringify(val));

    });

  }

  crearLibreta(){
    this.httpClient.get('http://ec2-13-58-239-128.us-east-2.compute.amazonaws.com:3100/formularios/nuevo').subscribe(plantilla=>{
        console.log('(home) httpclient json plantilla');
        console.log(plantilla);
        console.log(plantilla["data"]);

        //Definicion de la libreta
        let libretaTemporal={
          fechaCreacion:new Date(),
          fechaLibreta:this.fechaLibreta,
          coordenadas:null,
          fechaAcceso:null,
          fechaGuardado:null,
          version:0,
          usuario:'cbenitez',
          data:plantilla["data"]
        }
        this.events.publish('home:crearLibreta',libretaTemporal);

      },error=>{
        console.log('error httpclient');
        console.log(JSON.stringify(error));
      });

  }
  //esto viene del boton y con el bucle que se hara de comprobacion entonces ya aseguro de que pueda o no pueda editar
  editarLibreta(){
    this.httpClient.get('http://ec2-13-58-239-128.us-east-2.compute.amazonaws.com:3100/formularios/nuevo').subscribe(plantilla=>{
        console.log('(home) httpclient json plantilla');
        console.log(plantilla);
        console.log(plantilla["data"]);
        this.storage.get(this.fechaLibreta).then(res=>{
          //falta comprobar en caso de que se haya sincronizado se debe hacer en la sincronizacion que deje esta libreta en una clave temporal para validar si no entra en el lenght del get primero luego hara la comprobacion del temporal
          console.log('version de la ultima libreta en el storage:',res[res.length-1].version);
          let libretaTemporal=res[res.length-1];
          libretaTemporal.fechaAcceso=new Date();
          libretaTemporal.version=libretaTemporal.version+1;


          this.events.publish('home:editarLibreta',libretaTemporal);
        });
        //this.events.publish('home:editarLibreta',libretaTemporal);

      },error=>{
        console.log('error httpclient');
        console.log(JSON.stringify(error));
      });

  }
  async changeDate(fechaLibreta){
     this.diagnostic.isLocationEnabled().then((res)=>{console.log('(home diagnostic)');console.log(res)}).catch((res)=>{console.log('(home diagnostic error)');console.log(res)});

    this.comprobandoLibreta=true;
    this.creacionLibreta=false;
    this.edicionLibreta=false;
    this.messageButton="Espere...";
    let keys:any=await this.storage.keys();
    let libretasEnviadas=await this.storage.get('libretasEnviadas');
    let libretasFechasEnviadas:any=await this.promesaGetFechasEnviadas(libretasEnviadas);

      if (keys.includes(fechaLibreta) && !libretasFechasEnviadas.includes(fechaLibreta)) {
        console.log('Editar');

        this.creacionLibreta=false;
        this.edicionLibreta=true;
        this.messageButton="Editar Libreta";

      }
      else if(!keys.includes(fechaLibreta) && !libretasFechasEnviadas.includes(fechaLibreta)){
        console.log('Crear libreta');
        this.creacionLibreta=true;
        this.edicionLibreta=false;
        this.messageButton="Crear Libreta";

      }

      else if (!keys.includes(fechaLibreta) && libretasFechasEnviadas.includes(fechaLibreta)) {
        console.log('Libreta Enviada');
        this.messageButton="Libreta enviada, no puedes acceder";
      }
      this.comprobandoLibreta=false;

  }

  promesaGetFechasEnviadas(libretasEnviadas){
    return new Promise(resolve=>{
      console.log(libretasEnviadas);
      let listaFechasLibretasEnviadas=[];
      if (!libretasEnviadas) {
        libretasEnviadas=[];
      }
      for(let i=0;i<libretasEnviadas.length;i++){
        listaFechasLibretasEnviadas.push(libretasEnviadas[i].fechaLibreta);
      }
      console.log(listaFechasLibretasEnviadas);
      resolve(listaFechasLibretasEnviadas);
    });

  }

}
