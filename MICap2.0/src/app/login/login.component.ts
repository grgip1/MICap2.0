import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MidataConnection } from '../../services/MidataConnection';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthRequest, GetRecordRequest, } from '../../services/authentication';

import { Http, RequestOptions, Headers } from '@angular/http';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})

export class LoginComponent implements OnInit {

  private loginCredent: FormGroup;
  private username: FormControl;
  private password: FormControl;
  private device: FormControl;
  private errorMessage: string;
  private errorOccured: boolean;
  private authURL = 'https://test.midata.coop/v1/auth';
  private appName = 'MICap2.0';
  private appSecret = 'Bsc2018';

  constructor(private router: Router, private midata: MidataConnection, private http: Http) {
  }

  ngOnInit() {
    this.createFormControls();
    this.createForm();
  }

  createFormControls() {
    this.username = new FormControl('', Validators.required);
    this.password = new FormControl('', Validators.required);
    this.device = new FormControl('', Validators.required);
  }

  createForm() {
    this.loginCredent = new FormGroup({
      username: this.username,
      password: this.password,
      device: this.device,
    });
  }

  login() {
    let authRequest: AuthRequest = {
      username: this.username.value,
      password: this.password.value,
      appname: this.appName,
      secret: this.appSecret,
      device: this.device.value,
      role: 'research'
    };

    this.http.post(this.authURL, authRequest).toPromise()
      .then(
        (res) => {
          const bundle = JSON.parse(res.text());
          this.midata.setLogin(bundle.authToken, bundle.refreshToken, bundle.owner);
          console.log(this.midata.getData());
          localStorage.setItem('authToken', bundle.authToken);
        },
        error => {
          this.errorOccured = true;
          if (error.text() === 'Unknown user or bad password') {
            this.errorMessage = ' Anmeldung fehlgeschlagen. Benutzername oder Passwort ist nicht korrekt!';
          } else if (error.text() === 'The research app is not properly linked to a study! Please log in as researcher and link the app properly.') {
            this.errorMessage = 'Anmeldung fehlgeschlagen. Die Applikation ist nicht mit einer Studie verlinkt! Bitte mit einem Forscher-Konto anmelden!';
          } else {
            this.errorMessage = 'Anmeldung fehlgeschlagen. Bitte gültige E-Mail-Adresse eingeben!';
          }
          localStorage.setItem('authToken', this.errorMessage);
          console.log(this.errorMessage);
        },
    )
    .then(() => {
      if (!this.errorOccured) {
        this.router.navigate(['home']);
      }
    })
  }

  toHome() {
    let headers = new Headers();
    headers.append('Authorization', 'Bearer ' + localStorage.getItem('authToken'));
    /* headers.append('Connection', 'keep-alive');
     headers.append('Host', 'test.midata.coop'); */

    let options = new RequestOptions({ headers: headers });

    this.http.get('https://test.midata.coop/fhir/Patient/_search', options).subscribe(res => console.log(JSON.parse(res.text())));

  }
}

