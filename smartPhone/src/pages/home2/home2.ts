import { Component } from '@angular/core';
import { NavController, MenuController, Events, ModalController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AgregarFormularioPage } from '../agregarFormulario/agregarFormulario';
import { modalEditarFormularioPage } from '../modalEditarFormulario/modalEditarFormulario';


import {HttpClient} from '@angular/common/http';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Diagnostic } from '@ionic-native/diagnostic';



@Component({
  selector: 'page-home2',
  templateUrl: 'home2.html'
})


export class HomePage2 {

  formularios=[{
    nombre:"Toma de dato Urdesa",
    plantilla:"Libreta Principal",
    descripcion:"Descripcion de prueba"
  },{
    nombre:"Toma de dato Guasmo Central",
    plantilla:"Libreta Principal",
    descripcion:"Descripcion de prueba"
  },{
    nombre:"Formulario del sur",
    plantilla:"Libreta Principal",
    descripcion:"Descripcion de prueba"
  },{
    nombre:"Encuesta a Ninos del norte",
    plantilla:"Libreta Principal",
    descripcion:"Descripcion de prueba"
  },{
    nombre:"Encuesta Forense",
    plantilla:"Libreta Principal",
    descripcion:"Descripcion de prueba"
  },{
    nombre:"Encuesta policias centro",
    plantilla:"Libreta Principal",
    descripcion:"Descripcion de prueba"
  }];
  flagDelete=false;
  selected=false;
  deleted=[];
  constructor(public modalCtrl: ModalController,private diagnostic: Diagnostic,private locationAccuracy: LocationAccuracy,public httpClient:HttpClient,private events: Events,public menuCtrl: MenuController,private storage: Storage,public navCtrl: NavController) {

    
  }


  selectItems(){
    if (this.flagDelete==false) {
      this.flagDelete=true;
    }
  }

  closeDelete(){
    this.flagDelete=false;
  }

  deleteAllSelected(){
    for(let i=0; i<this.deleted.length; i++){
      this.formularios.splice(this.formularios.indexOf(this.deleted[i]),1);
    }
    this.closeDelete();
    this.deleted=[];
  }  


  selectChecked(index){
    console.log(this.deleted.indexOf(this.formularios[index]));
    if (this.deleted.indexOf(this.formularios[index])!=-1) {
       this.deleted.splice(this.deleted.indexOf(this.formularios[index]),1);
    }
    else{
      this.deleted.push(this.formularios[index]);
    }

    console.log(this.deleted);
    
  }

  agregarFormulario(){
      let modal=this.modalCtrl.create(AgregarFormularioPage,{formularios:this.formularios});
      modal.present();
  }

  modalEdicionFormulario(indexFormulario){
    let modal=this.modalCtrl.create(modalEditarFormularioPage,{formularios:this.formularios,idFormularioEdicion:indexFormulario});
    modal.present();
  }

}

