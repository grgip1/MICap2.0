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

    login(username: string, password: string) {
      this.midata.login('lc2@test,ch', 'Lc12345678');
    }

  goToHome() {
    this.router.navigate(['home']);
  }

  ngOnInit() {
  }

}
