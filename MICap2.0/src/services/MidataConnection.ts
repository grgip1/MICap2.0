import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { AuthRequest, GetRecordRequest, } from './authentication'





@Injectable()
export class MidataConnection {

  private _authToken: string;
  private _refreshToken: string;
  private _user: string;
  private errorOccured: boolean;
  private errorMessage: string;
  public allData: any;
  public user: string;
  public dataCount: number;
  private authURL = 'https://test.midata.coop/v1/auth';
  private appName = 'MICap2.0';
  private appSecret = 'Bsc2018';



  constructor(private http: Http) {
  }


  login(username: string, password: string, device: string) {

    let authRequest: AuthRequest = {
      username: username,
      password: password,
      appname: this.appName,
      secret: this.appSecret,
      device: device,
      role: 'research'
    };

    this.http.post(this.authURL, authRequest).toPromise()
      .then(
      (res) => {
        console.log(res);
        const bundle = JSON.parse(res.text());

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
      }
      )
  }



  logout() {
    this._authToken = undefined;
    this._refreshToken = undefined;
    this._user = undefined;
  }

  setLogin(authtoken: string, refreshtoken: string, user: string){
    this._authToken = authtoken;
    this._refreshToken = refreshtoken;
    this._user = user;
  }

  getDataCount() {
    return this.allData.size;
  }

  getUser() {
    return this._user
  }

  // Testing wie man an die daten vom Benutzer kommt
  /////////////////////////////////////////////////////////////
  public getData() {

    console.log(this._authToken, this._refreshToken, this._user);

/*
    const bundle = this.allData;
    const resources: any = [];
    const components: any = [];
    const values: any = [];


    // lädt alle daten als resource
    // bundle.then((msg) => {
    //   for (const key in msg) {
    //     resources.push(msg[key]);
    //   }
    // });

    // aus den daten sollen nur die componente geladen werden
    bundle.then((msg) => {
      for (const key in msg) {
        //if(msg[key]._fhir.code.coding[0].code == 'MSCogTestSD'){
        resources.push(msg[key]);
        //}

      }
    });

    bundle.then((msg) => {
      for (const key in msg) {
        components.push(resources[key].length);

        for (let i in msg[key]._fhir.component) {
          // values.push(msg[key]._fhir.component[i].valueQuantity.value)
          // resources.push(msg[key]._fhir.component[i].code.coding[0].display, msg[key]._fhir.component[i].valueQuantity.value)
          // console.log(msg[key]._fhir.component[i].code.coding[0].display);
          // console.log(msg[key]._fhir.component[i].valueQuantity.value);
          values.push([msg[key]._fhir.component[i].code.coding[0].display, msg[key]._fhir.component[i].valueQuantity.value]);
        }

      }
    });
    console.log(resources);
    console.log(components);
    console.log(values);
    return values;
    */
  }
}
