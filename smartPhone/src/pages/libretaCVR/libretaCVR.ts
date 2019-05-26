import { Component } from '@angular/core';
import { NavController,NavParams,MenuController,ToastController,Toast,Platform } from 'ionic-angular';
import { HTTP } from '@ionic-native/http';
import { File } from '@ionic-native/file';

import {Libreta2CVRPage} from '../libreta2CVR/libreta2CVR';

import {HttpClient} from '@angular/common/http';

import { catchError, map, tap } from 'rxjs/operators';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'page-libretaCVR',
  templateUrl: 'libretaCVR.html'
})
export class LibretaCVRPage {
  data;
  seccionSelected;
  libretaTemporal;
  libretaVersiones;
  toastAviso:Toast;
  constructor(private storage: Storage,public platform: Platform,private toastCtrl: ToastController,public menuCtrl:MenuController,public httpClient:HttpClient,public file:File,public http:HTTP,public navCtrl: NavController, public navParams:NavParams) {
            console.log('libreta params');
            console.log(this.navParams.data);
    this.seccionSelected=this.navParams.data.seccionSelected;
    this.libretaTemporal=this.navParams.data.libretaTemporal;
    this.libretaVersiones=this.navParams.data.libretaVersiones;
    this.data=this.seccionSelected.children;
//latitude:-2.1114448
//longitude:-79.8955406
//error de 20
    if (this.libretaTemporal.gps) {
      //alert(this.libretaTemporal.coordenadas.latitude);
      //alert(this.libretaTemporal.coordenadas.longitude);

      this.storage.get('usuarioVinculado').then((val) => {
        console.log('main (comprobando existencia de usuario vinculado):',JSON.stringify(val));
        if (val!=null && val.sesion) {
          let distancia=this.getDistanceFromLatLonInKm(this.libretaTemporal.coordenadas.latitude,this.libretaTemporal.coordenadas.longitude,val.data.latitud,val.data.longitud);
          if (distancia*1000>200) {
            this.toastAviso = this.toastCtrl.create({
              message: 'No te encuentras cerca de la estacion',
              position: 'bottom',
              showCloseButton:true,
              closeButtonText:'ok'
            });
            this.toastAviso.present();
            
          }
          
        }
        
      }).catch(error => {
        console.log('main (hubo error en catch en check existencia de usuario vinculado)',error);
      });

        
        
    
      
    }
    


    

    
  }

  ionViewWillEnter(){
    this.menuCtrl.enable(false);
    
  }

  ionViewWillUnload(){
    
    try{
      
      if (this.toastAviso!=null) {
        this.toastAviso.dismiss();
        
      }
      
    }catch(err){
      alert(err);
    }
    this.menuCtrl.enable(true);

  }

  

  clickCollapseButton(index,id,$event){
    let buttonElement=$event.currentTarget;
    let collapse= document.getElementById(id);
    
    if (collapse.getAttribute('class')=="collapse") {
    	console.log('class colapse');
      buttonElement.getElementsByTagName('ion-icon')[0].setAttribute('class','icon icon-md ion-md-arrow-dropdown item-icon');
      console.log(buttonElement.getElementsByTagName('ion-icon')[0]);
    	//console.log(this.data[index].expanded);
      //this.data[index].expanded=true;
    }
    else if (collapse.getAttribute('class')=="collapse show") {
    	console.log('class colapse show');
      console.log(index);
      console.log(this.data[index]);
      buttonElement.getElementsByTagName('ion-icon')[0].setAttribute('class','icon icon-md ion-md-arrow-dropright item-icon');
            console.log(buttonElement.getElementsByTagName('ion-icon')[0]);
    }
      
  }

  clickNextPage(indexCategoria,indexSubCategoria){
    let param=this.navParams.data;
    param.seccionSelected=this.seccionSelected;
    if (indexCategoria!=null) {
      console.log('concategoria');
      param.seccionSelected2=this.seccionSelected.children[indexCategoria].children[indexSubCategoria];
    }
    else{
      console.log('sincategoria');
      param.seccionSelected2=this.seccionSelected.children[indexSubCategoria];
    }
    this.navCtrl.push(Libreta2CVRPage,param);
  }

  compareFn(e1, e2): boolean {
    return e1 && e2 ? e1.label === e2.label : e1 === e2;
  }

  backButtonAction(){
        alert('backbutton');
    }

  getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
    var dLon = this.deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180)
  }
   //let distancia=this.getDistanceFromLatLonInKm(res.coords.latitude,res.coords.longitude,-2.110992,-79.898687);


  

}
