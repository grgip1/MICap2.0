import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MidataConnection } from '../../services/MidataConnection';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: []
})
export class HomeComponent implements OnInit {

  REDCapToken: any; // TODO: herausfinden ob nur nurmerisch
  midataCount: number; // Anzahl ausgelesene Daten
  REDCapStudy: any; // TODO: wird auch der Name der Studie ausgegeben?
  user: any;
  datas = [];

  constructor(private router: Router, private midata: MidataConnection) { }

  ngOnInit() {
    this.user = this.midata.user;
    this.midataCount = this.midata.dataCount;
    this.datas = this.midata.getData();
    console.log(this.datas);
    // console.log(this.midata.getDataCount);
    // console.log(this.midata.getDataCount());
    // console.log(this.midata.getUser());
  }

  logout() {
    this.midata.logout();
    this.router.navigate(['login']);
  }

}
