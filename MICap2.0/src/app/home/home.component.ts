import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MidataConnection } from '../../services/MidataConnection'
import { Midata } from 'Midata';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: []
})
export class HomeComponent implements OnInit {

  constructor(private router: Router, private midata: MidataConnection) { }

  ngOnInit() {
    this.midata.getData();
  }

  goToLogin() {
    this.router.navigate(['login']);
  }

}
