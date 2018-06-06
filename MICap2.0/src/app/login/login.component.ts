import { DialogComponent } from './../dialog/dialog.component';
import { MatDialog } from '@angular/material';
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

  constructor(private router: Router, private midata: MidataConnection, private http: Http, public dialog: MatDialog) {
  }

  // Beim laden der Komponente werden die Form-Controller und die Form-Gruppe erstellt.
  ngOnInit() {
    this.createFormControls();
    this.createForm();
  }

  changeColor(color: boolean) {
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
    }

    let PatientNames: Array<String> = [];
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
        }).catch(
          error => {
            this.errorOccured = true;
            if (error.text() === 'Unknown user or bad password') {
              this.errorMessage = ' Anmeldung fehlgeschlagen! Benutzername oder Passwort ist nicht korrekt!';
            } else if (error.text() === 'The research app is not properly linked to a study! Please log in as researcher and link the app properly.') {
              this.errorMessage = 'Anmeldung fehlgeschlagen! Die Applikation ist nicht mit einer Studie verlinkt! Bitte mit einem Forscher-Konto anmelden!';
            } else {
              this.errorMessage = 'Anmeldung fehlgeschlagen! Bitte gültige E-Mail-Adresse eingeben!';
            }
          })

      // Fals kein fehler auftritt, wird der Nutzer zu der HomePage weitergeleitet.
      .then(
        () => {
          let headers = new Headers();
          headers.append('Authorization', 'Bearer ' + this.midata._authToken);
          let Options = new RequestOptions({ headers: headers });

          // Verbindung mit MIDATA und herauslesen wie viele Patienten in der Studie sind und der User wird gesetzt.
          this.http.get(this.midata.patientRequestURL, Options).toPromise()
            .then(
              res => {
                const bundle = JSON.parse(res.text());
                this.midata.PatientNumber= bundle.total;
                console.log(bundle);
                for (var i = 0; i < 4; i++) {
                  PatientNames.push(bundle.entry[i].resource.name[0].given[0] + ' ' + bundle.entry[i].resource.name[0].family)
                }
                if (PatientNames === undefined && PatientNames.length === 0) {
                  console.log('Ist pseudonymisiert!');
                } else {
                  console.log('Ist nicht pseudonymisiert!');

                  console.log(PatientNames);
                }
              })
            .then(
              () => {
                if (PatientNames.length > 0 && this.export) {
                  let dialogRef = this.dialog.open(DialogComponent, {
                    width: '600px',
                    data:
                      'Mit ihren momentanen Berechtigungen können sie die Studiendaten nicht pseudonymisiert sehen. ' +
                      'Dies ist ein Problem, da MICap 2.0 anhand der Pseudonyme die Daten in REDCap speichert. ' +
                      'Wenn MICap 2.0 mit Ihren Berechtigungen exportiert, werden patientenidentifizierende Daten nach REDCap mitexportiert (z.B Name und Vorname vom Patienten). ' +
                      'Aus diesem Grund wird kein Export gemacht. Falls Sie einen Export machen wollen, melden Sie sich mit einem MIDATA-Konto an, welches die Studiendaten nur pseudonymisiert sehen kann!'
                  });
                  dialogRef.afterClosed().subscribe(res => {
                    console.log(`Entschieden: ${res}`);
                  });
                } else if (PatientNames.length > 0 && !this.export) {
                  if (!this.errorOccured) {
                    this.router.navigate(['feedback']);
                  }
                }
              }
            ).catch(() => {
              if (PatientNames.length === 0 && !this.export && !this.errorOccured) {

                let dialogRef = this.dialog.open(DialogComponent, {
                  width: '600px',
                  data:
                    'Mit ihren momentanen Berechtigungen können sie die Studiendaten nur pseudonymisiert sehen. ' +
                    'MICap 2.0 kann eine Re-Identifizierung nur mit einem MIDATA-Konto durchführen, welches die Studiendaten nicht pseudonymisiert sehen kann! ' +
                    'Falls Sie die Rückmeldungen an die Patienten senden wollen, müssen Sie sich mit einem MIDATA-Konto anmelden, welches die Studiendaten nicht pseudonymisiert sehen darf!'
                });
                dialogRef.afterClosed().subscribe(res => {
                  console.log('stay');
                });
              } else if (PatientNames.length === 0 && this.export) {
                if (!this.errorOccured) {
                  this.router.navigate(['home']);
                }
              }
            });// then patliste abfüllen
        })
  }// login
}//klasse




