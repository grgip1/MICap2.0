import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MidataConnection } from '../../services/MidataConnection';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthRequest } from '../../services/authentication';

import { Http, RequestOptions, Headers } from '@angular/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})

/**
 * Diese Klasse verbindet Meldet sich bei MIDATA mit den erhaltenen Nutzerinformationen an.
 */
export class LoginComponent implements OnInit {

  private loginCredent: FormGroup;  // Form-Name für das Login-Submit
  private username: FormControl;    // Form-Controller welcher den Benutzername beinhaltet.
  private password: FormControl;    // Form-Controller welcher das Passwort beinhaltet.
  private device: FormControl;      // Form-Controller welcher den Device-Code beinhaltet.
  private errorMessage: string;     // Fehlermeldung welche beim Login auftritt.
  private errorOccured: boolean;    // Indikator dass ein Fehler aufgetrten ist.

  // private selectLogin = [
  //   'Rückmeldung holen',
  //   'Daten nach REDCap exportieren'
  // ];
  private export: boolean = true;

  constructor(private router: Router, private midata: MidataConnection, private http: Http) {
  }

  // Beim laden der Komponente werden die Form-Controller und die Form-Gruppe erstellt.
  ngOnInit() {
    this.createFormControls();
    this.createForm();
  }

  changeColor (color: boolean) {
    this.export = color
    this.errorOccured = false;
    this.errorMessage = undefined;
    console.log(this.export);
  }

  // Erstellt die Form-Controller. Dabiei ist ein Validator notwendig
  createFormControls() {
    this.username = new FormControl('', Validators.required);
    this.password = new FormControl('', Validators.required);
    this.device = new FormControl('', Validators.required);
  }

  // Erstellt eine From-Gruppe und setzt die Variablen ein.
  createForm() {
    this.loginCredent = new FormGroup({
      username: this.username,
      password: this.password,
      device: this.device,
    });
  }

  // Meldet sich mit dem vom Nutzer eingegebenen Benutzernamen und Passwort bei MIDATA an.
  login() {

    /**
     * Setzt den Fehlerindikatr auf false, da eine Anmeldung versucht wird.
     * Ist nötig fals das Login fehlgeschlagen hat und es erneut versucht wird.
     */
    this.errorOccured = false;

    // Notwendige Anmeldeparameter welche mit dem http.post mitgegeben werden.
    let authRequest: AuthRequest = {
      username: this.username.value,
      password: this.password.value,
      appname: this.midata.REDCapExportAppName,
      secret: this.midata.AppSecret,
      device: this.device.value,
      role: 'research'
    };

    /**
     * Meldet sich mit dem vom Nuter angegebenen Anmeldeparameter an.
     * Im gleichen Schritt wird der Authentifikations-Token,
     * Refresh-Token und der Nuter im Service MidataConnection gespeichert.
     * Falls sich ein Fehler auftaucht wird dieser abgefangen mit dem error.
     */
    this.http.post(this.midata.authURL, authRequest).toPromise()
      .then(
        (res) => {
          const bundle = JSON.parse(res.text());
          this.midata.setLogin(bundle.authToken, bundle.refreshToken, bundle.owner);
          this.midata._authToken = bundle.authToken;
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
        },
    )
      // Fals kein fehler auftritt, wird der Nutzer zu der HomePage weitergeleitet.
      .then(() => {
        if (!this.errorOccured) {
          if (this.export) {
            this.router.navigate(['home']);
          } else {
            this.router.navigate(['feedback']);
          }
        }
      })
  }
}
