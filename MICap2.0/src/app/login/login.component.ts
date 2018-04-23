import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Midata } from 'Midata';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {

  constructor(private router: Router, private midata:Midata) {
    this.midata = new Midata('https://test.midata.coop', 'MICap2.0', 'Bsc2018')
   }

    login() {
      this.midata.login('Lc2@test.ch', 'Lc12345678');
      console.log(this.midata.authToken);
    }

  goToHome(){
    this.router.navigate(['home']);
  }

  ngOnInit() {
  }

}
