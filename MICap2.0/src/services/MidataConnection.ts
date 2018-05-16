import { Midata, resources, Resource, Bundle } from 'Midata';
import { Injectable } from '@angular/core';
import { fromFhir } from 'Midata/dist/src/resources/registry';


@Injectable()
export class MidataConnection {

  public errorOccured: boolean;
  public errorMessage: string;
  private midata: Midata;
  public allData: any;
  public user: string;
  public dataCount: number;

  constructor() {
    this.midata = new Midata('https://test.midata.coop', 'MICap2.0', 'Bsc2018');
  }

  login(username: string, password: string) {
    this.errorOccured = false;
    this.midata.login(username, password, 'research')
      .catch((err) => {
        this.errorOccured = true;
        const errmessage = JSON.parse(err.body);
        this.errorMessage = errmessage.message;
        console.log(errmessage.message);
      });
    this.user = this.midata.user.name;
    console.log(this.user);
    this.allData = this.midata.search(/*'QuestionnaireResponse'*/'Observation');
  }

  logout() {
    this.midata.logout();
  }

  getDataCount() {
    return this.allData.size;
  }

  getUser() {
    return this.midata.user.name;
  }

  // Testing wie man an die daten vom Benutzer kommt
  /////////////////////////////////////////////////////////////
  public getData() {
    const bundle = this.allData;
    const resources: any  = [];
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

        for(let i in msg[key]._fhir.component) {
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
  }
  ////////////////////////////////////////////////////////////////////////////////


  // Noch aus LC2 --> nicht sicher ob noch nützlich
  ////////////////////////////////////////////////////////////////////////////////
  createfhir(bundle: JSON) {

    const ressources = [];
    for (const key in bundle) {

      if (!bundle.hasOwnProperty(key) // skip prototype extensions
        || !bundle[key].hasOwnProperty('ressource') // skip non account objects
      ) {
        continue;
      }

      ressources.push(bundle[key]);

      console.table(ressources);
    }
    // for (let)
    // var ressource = fromFhir();
  }
  ////////////////////////////////////////////////////////////////////////////////
}
