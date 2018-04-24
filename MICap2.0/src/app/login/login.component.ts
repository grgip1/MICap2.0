import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MidataConnection } from '../../services/MidataConnection';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {

  constructor(private router: Router, private midata: MidataConnection) {

   }

    login() {
      this.midata.login('phil.forscher@lc2.ch', 'MIDATA2017p!');
    }

  goToHome() {
    this.router.navigate(['home']);
  }

  ngOnInit() {
  }

}
