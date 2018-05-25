import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MidataConnection } from '../../services/MidataConnection';

import { Http, RequestOptions, Headers } from '@angular/http';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: []
})
export class HomeComponent implements OnInit {

  private redcapToken: FormGroup;
  private redcapAPI: FormControl;
  REDCapToken: any; // TODO: herausfinden ob nur nurmerisch
  midataCount: any; // Anzahl ausgelesene Daten
  REDCapStudy: any; // TODO: wird auch der Name der Studie ausgegeben?
  user: any;
  dataEntry: number;
  patients: number;
  options: RequestOptions;

  constructor(private router: Router, private midata: MidataConnection, private http: Http) {
  }

  ngOnInit() {

    if (this.REDCapToken == undefined) {
      this.REDCapToken = 'Keinen REDCap-API-Token angegeben';
    }

    let headers = new Headers();
    headers.append('Authorization', 'Bearer ' + localStorage.getItem('authToken'));
    this.options = new RequestOptions({ headers: headers });

    this.http.get(this.midata.patientRequest, this.options).toPromise()
      .then(res => {
        const bundle = JSON.parse(res.text());
        console.log(bundle);
        this.patients = bundle.entry.length;
        this.user = this.midata._user;
      }
      );
  }

  createFormControls() {
    this.redcapAPI = new FormControl('');
  }

  createForm() {
    this.redcapToken = new FormGroup({
      redcapAPI: this.redcapAPI
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['login']);
  }

  save(token: string) {
    console.log(token);
    this.REDCapToken = token;

  }

  pushToRedCap() {

    let bundle: any;

    this.http.get(this.midata.observationRequest, this.options).toPromise()
      .then(res => {
        bundle = JSON.parse(res.text());
        console.log(bundle);
        this.dataEntry = bundle.entry.length;
      }).then(() => {
        for (let key in bundle.entry) {
          //console.log(bundle.entry[key].resource.code.coding[0].code);
          if (bundle.entry[key].resource.code.coding[0].code === "MSCogTestLab") {
            for (let comp in bundle.entry[key].resource.component) {
              console.log(bundle.entry[key].resource.component[comp].code.coding[0].code);
              console.log(bundle.entry[key].resource.component[comp].valueQuantity.value);
            }
            // console.log(bundle.entry.component);
            // console.log(bundle.entry[key]);
          }
        }
      })

  }

}
