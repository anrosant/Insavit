import { Component } from '@angular/core';
import { NavController,NavParams } from 'ionic-angular';
import { HTTP } from '@ionic-native/http';
import { File } from '@ionic-native/file';

import {Libreta2Page} from '../libreta2/libreta2';

import {HttpClient} from '@angular/common/http';

import { catchError, map, tap } from 'rxjs/operators';

@Component({
  selector: 'page-libreta',
  templateUrl: 'libreta.html'
})
export class LibretaPage {
  data;
  indexHorario;
  libretaTemporal;
  constructor(public httpClient:HttpClient,public file:File,public http:HTTP,public navCtrl: NavController, public navParams:NavParams) {
            console.log('libreta params');
            console.log(this.navParams.data);
    this.indexHorario=this.navParams.data.indexHorario;
    this.libretaTemporal=this.navParams.data.libretaTemporal;
    this.data=this.libretaTemporal.data[this.indexHorario].children;
    

 
    
  }

  clickCollapseButton(index,id,$event){
    /*
    let button=$event.currentTarget;
    console.log(this.data[index].expanded);
    console.log(button.getAttribute('aria-expanded'));


    if (button.getAttribute('aria-expanded')=="false") {
      this.data[index].expanded=true;
    }
    else{
      this.data[index].expanded=false;
    }
    */
    let buttonElement=$event.currentTarget;
    let collapse= document.getElementById(id);
    
    //let button= collapse.parentElement.querySelector("button[data-toggle]");
    
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

    	//console.log(this.data[index].expanded);

      //this.data[index].expanded=false;
    }
      
  }


  clickNextPage(indexCategoria,indexSubCategoria){
    this.navCtrl.push(Libreta2Page,{
      indexHorario:this.indexHorario,
      indexCategoria:indexCategoria,
      indexSubCategoria:indexSubCategoria,
      libretaTemporal:this.libretaTemporal,
    });
  }

  

}
