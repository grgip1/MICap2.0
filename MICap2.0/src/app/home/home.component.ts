import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MidataConnection } from '../../services/MidataConnection';
import { HttpModule } from '@angular/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: []
})
export class HomeComponent implements OnInit {

  REDCapToken: any; // TODO: herausfinden ob nur nurmerisch
  midataCount: any; // Anzahl ausgelesene Daten
  REDCapStudy: any; // TODO: wird auch der Name der Studie ausgegeben?
  user: any;
  datas = [];

  constructor(private router: Router, private midata: MidataConnection, private http: HttpModule) { }

  ngOnInit() {
    this.setMetadata();
    console.log(this.datas);
    // this.http
  }

  private setMetadata() {
    this.datas = this.midata.getData();
    this.user = this.midata.user;
    this.midataCount = this.datas.length;
  }

  logout() {
    this.midata.logout();
    this.router.navigate(['login']);
  }

   arrayTest(){
  //   for(let entry of this.datas){
  //     for(let vaule of entry){
  //       console.log(vaule);
  //     }
  //   }
  console.log(this.midataCount);
   }

}
