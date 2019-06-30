import { Component } from '@angular/core';
import { Platform,Events,MenuController,NavController,App,LoadingController,AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';

import { AuthPage } from '../pages/auth/auth';
import { AuthCVRPage } from '../pages/authCVR/authCVR';
import {HomePage} from '../pages/home/home';
import {HomePage2} from '../pages/home2/home2';
import {HomeCVRPage} from '../pages/homeCVR/homeCVR';

import {PerfilPage} from '../pages/perfil/perfil';
import {LibretasEnviadasPage} from '../pages/libretasEnviadas/libretasEnviadas';
import {LibretaPage} from '../pages/libreta/libreta';
import {misLibretasPage} from '../pages/misLibretas/misLibretas';


import { HTTP } from '@ionic-native/http';

import {HttpClient} from '@angular/common/http';

import { Coordinates,Geolocation } from '@ionic-native/geolocation';

import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Diagnostic } from '@ionic-native/diagnostic';





@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;
  flagMenu:boolean=false;
  params:any={usuarioViculado:null};
  fechaIncioApp=new Date();
  listaGeneral=[{page:HomeCVRPage,icon:"ios-home-outline",label:"Principal"},{page:PerfilPage,icon:"ios-person-outline",label:"Perfil"},{page:misLibretasPage,icon:"ios-paper-outline",label:"Mis Libretas"}];
  indexSelectedGeneral=0;
  indexSelectedLibreta=null;
  plantillaApp;
  libretaTemporal;
  rootParams;

  libretaPage=LibretaPage;
  observacionPage;
  fenomenosPage;
  enviandoLibretas=false;
  messageLibretaEnviada="Enviando...";


  LibretasEnviar1=[];
  LibretasEnviar2={};
  // urlServerEnvioLibreta="http://ec2-13-58-239-128.us-east-2.compute.amazonaws.com/formularios";
  urlServerEnvioLibreta="http://150.136.230.16/api/send_form/";
  urlServerPlantilla="http://192.168.0.10:8000/prueba/plantilla";
  urlServerCalculos="http://192.168.0.10:8000/prueba/calculos";

  constructor(private diagnostic: Diagnostic,private locationAccuracy: LocationAccuracy,public http:HTTP,public alertCtrl: AlertController,private geolocation: Geolocation,public loadingCtrl:LoadingController,public appCtrl:App,public httpClient:HttpClient,private storage: Storage,public menuCtrl: MenuController,private events: Events,platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.events.subscribe('libretasPendientes:editarLibreta',(fechaLibreta)=>{
        this.selectItemMenuGeneral(this.listaGeneral[0],0,null);
        this.appCtrl.getRootNav().setRoot(HomeCVRPage,{fechaLibreta:fechaLibreta});

      });
      window.addEventListener('beforeunload',()=>{
        console.log('SE ESTA CERRANDOOOOOOOOOOOO');
        setTimeout(()=>{
          console.log('setime oout cerrando');
        },3000);
      });

      statusBar.styleDefault();
      splashScreen.hide();
      this.listenToLoginEvents();

      this.storage.get('fechaInstalacion').then(data=>{
        console.log('(app) fecha get storage', JSON.stringify(data));
        if (data==null) {
          console.log('guardando fecha debido a que es tu primera vez');
          this.storage.set('fechaInstalacion',this.fechaIncioApp);
        }
      });
      this.getPlantillaApp();

      this.storage.forEach((value,key,index)=>{
        console.log('-----app for each stroage-------');
        console.log('key:',key);
        console.log('-------value>');
        console.log(value);

        let keyValidador= new Date(key);

        if (keyValidador.getTime()) {
          this.LibretasEnviar1.push(value);
          this.LibretasEnviar2[key]=value;
        }


        //console.log("2018-12-01".match('([0-9]{4})-([0-9]{2})-([0-9]{2})'));
        //console.log(new Date('hola'));
        //let hola=new Date("jkkjkjkjkjkjkjkkkk");
        //let mili=hola.getTime();
        //console.log(mili);
        //if (mili) {
          //console.log('valido');
        //}else{
        //  console.log('invalido');
        //}
      }).then(res=>{
        console.log("------------DATA A SINCRONIZAR--------------");
        console.log(this.LibretasEnviar1);
        console.log(this.LibretasEnviar2);
        console.log("--------------------------------------------");
      });


      this.storage.get('usuarioVinculado').then((val) => {
        console.log('main (comprobando existencia de usuario vinculado):',JSON.stringify(val));
        this.params.usuarioVinculado=val;
        if (val!=null && val.sesion) {
          //this.appCtrl.getRootNav().setRoot(item.page);
          this.selectItemMenuGeneral(this.listaGeneral[0],0,null);
        }
        else{
          this.appCtrl.getRootNav().setRoot(AuthPage);
          //this.selectItemMenuGeneral(this.listaGeneral[0],0,null);
        }

      }).catch(error => {
        console.log('main (hubo error en catch en check existencia de usuario vinculado)',error);

      });


      setInterval(()=>{
          this.httpClient.get(this.urlServerPlantilla).subscribe(res=>{
            this.storage.set('plantilla',res);
          },err=>{
            console.log('error no puede conectarse al servidor para descarga de plantilla');
          });
          this.httpClient.get(this.urlServerCalculos,{responseType: 'text'}).subscribe(res=>{
              this.storage.set('calculos',res);
            },err=>{
              console.log('error no puede conectarse al servidor para descarga de calculos');
            });
      },3000);

      this.storage.get('plantilla').then((plantilla)=>{
          if (plantilla==null) {
            console.log('data sin no hay clave plantilla');
            console.log(plantilla);
            this.httpClient.get('./assets/plantilla/plantilla.json').subscribe(res=>{
              console.log('seteando plantilla');
              console.log(res);
              this.storage.set('plantilla',res);
            },err=>{
              console.log('error no puede conectarse al servidor para descarga de plantilla');
            });

          }else{
            console.log('si hay plantilla'); console.log(plantilla);
          }
      });

      this.storage.get('calculos').then((calculos)=>{
          if (calculos==null) {
            this.httpClient.get('./assets/calculos/calculos.txt',{responseType: 'text'}).subscribe(res=>{
              console.log('seteando calculos');
              console.log(res);
              this.storage.set('calculos',res);
            },err=>{
              console.log('error no puede conectarse al servidor para descarga de plantilla');
            });

          }else{
            console.log('si hay calculos'); console.log(calculos);


          }
      });

    });



  }




  promesaEnvioLibreta(libreta){
    return new Promise((resolve,reject)=>{

      this.httpClient.post(this.urlServerEnvioLibreta,libreta).subscribe(res=>{
        let responseJson={responseData:res,fechaEnvio:new Date(),error:false};
        console.log(res)
        resolve(responseJson);
      },err=>{
        console.log('error en promesa');
        console.log(err);
        let responseJson={responseData:err,fechaEnvio:null,error:true};
        resolve(responseJson);
      });

    });
  }


  async envioLibretas2(){

      this.events.publish('app:envioLibretas', true);
      let libretas=[];
      let alert;
      let alert2;

      if (this.enviandoLibretas==false) {
        this.messageLibretaEnviada="Enviando...";
        console.log('hola primer');
        alert=this.alertCtrl.create({
            title: "Enviando",
            buttons: ["ok"]
        });;
        alert.present();
        this.enviandoLibretas=true;


        console.log('comenzando................');


        let keys= await this.storage.keys();


        for( let i=0; i<keys.length; i++) {

          let keyValidador= new Date(keys[i]);

          if (keyValidador.getTime()) {
            console.log(keys[i]);
            let libreta= await this.storage.get(keys[i]);
            let result= await this.promesaEnvioLibreta(libreta);
            if (result['error']) {
               console.log('hubo un error');
               this.enviandoLibretas=false;
               if (alert) {
                 console.log('hola error');
                 alert.dismiss();
               }
               alert2=this.alertCtrl.create({
                      title: "Se detuvo el envio. Problemas de conexion con el servidor",
                      buttons: ["ok"]
                  });;
               alert2.present();
               break;
             }
             else{
               console.log('borrando en storage');


               await this.storage.remove(keys[i]);
               let lenviadas=await this.storage.get('libretasEnviadas');
               if (lenviadas) {
                 lenviadas.push({fechaEnvio:result["fechaEnvio"],fechaLibreta:keys[i]});
               }
               else{
                 lenviadas=[{fechaEnvio:result["fechaEnvio"],fechaLibreta:keys[i]}];
               }
               await this.storage.set('libretasEnviadas',lenviadas);

             }
          }
          if (i==keys.length-1) {
                 this.enviandoLibretas=false;
                 if (alert) {
                   console.log('hola todas');
                   alert.dismiss();
                 }

                 alert2=this.alertCtrl.create({
                      title: "Todas las libretas han sido correctamente enviadas",
                      buttons: ["ok"]
                  });;
                  alert2.present();
          }
        }


        console.log('------------TERMINANDO--------------------');
      }else{
        if (alert2) {
          alert2.dismiss();
        }
        alert=this.alertCtrl.create({
            title: "Enviando",
            buttons: ["ok"]
        });;
        alert.present();
      }

      this.events.publish('app:envioLibretas', false);




  }

  selectItemMenuGeneral(item,index,$event){

    this.indexSelectedLibreta=null;
    this.indexSelectedGeneral=index;
    this.menuCtrl.close();
    this.appCtrl.getRootNav().setRoot(item.page);
  }

  selectItemMenuLibreta(index,page){
    this.indexSelectedGeneral=null;
    this.indexSelectedLibreta=index;
    this.menuCtrl.close();

    this.rootParams={
      indexHorario:index,
      libretaTemporal:this.libretaTemporal,
    }

    this.appCtrl.getRootNav().setRoot(page, this.rootParams );

    console.log('(app) rootparams');
    console.log(this.rootParams);

  }

  listenToLoginEvents(){


    this.events.subscribe('home:crearLibreta',(libretaTemporal)=>{
      if (this.enviandoLibretas) {
        let alert=this.alertCtrl.create({
            title: "Eror",
            subTitle:"No puedes crear una libreta mientras se estan enviando las libretas locales",
            buttons: ["ok"]
        });;
        alert.present();
      }
      else{
        console.log('(app) libreta temporal event');
        this.libretaTemporal=libretaTemporal;
        this.selectItemMenuLibreta(0,this.libretaPage);
      }

    });
    this.events.subscribe('home:editarLibreta',(libretaTemporal)=>{
      if (this.enviandoLibretas) {
        let alert=this.alertCtrl.create({
            title: "Enviando",
            subTitle:"No puedes editar una libreta mientras se estan enviando las libretas locales",
            buttons: ["ok"]
        });;
        alert.present();
      }
      else{
        console.log('(app) libreta temporal event');
        console.log('--------------------event edicion---------------');
        console.log(libretaTemporal);
        this.libretaTemporal=libretaTemporal;
        this.selectItemMenuLibreta(0,this.libretaPage);
      }


    });

    this.events.subscribe('libretasPendientes:enviarLibretas',()=>{
          this.envioLibretas2();
      });


  }

  cerrarSesion(){
    this.storage.get('usuarioVinculado').then((val) => {
      this.storage.set('usuarioVinculado',val).then(data=>{
        console.log('(home) set storage usuarioVinculado',JSON.stringify(data));
        this.indexSelectedGeneral=0;
        this.appCtrl.getRootNav().setRoot(AuthPage);

      });
    });
  }

   getPlantillaApp(){
     this.httpClient.get('./assets/plantilla/plantilla.json').subscribe(plantilla=>{
        console.log('(app) httpclient json plantilla');
        console.log(plantilla);
        this.plantillaApp=plantilla;
      },error=>{
        console.log('error httpclient');
        console.log(JSON.stringify(error));
        this.plantillaApp=null;
      });
   }



}
