import { Midata, resources, Resource, Bundle } from 'Midata';
import { Injectable } from '@angular/core';
import { fromFhir } from 'Midata/dist/src/resources/registry';


@Injectable()
export class MidataConnection {

  private midata: Midata;

  constructor() {
    this.midata = new Midata('https://test.midata.coop', 'MICap2.0', 'Bsc2018');
  }

  login(username:string, password:string) {
    this.midata.login(username, password, 'research');
      // .then(() => {
      //   this.midata.fetchFHIRConformanceStatement();})
      //   .then((msg) => {
      //     if (this.midata.authToken){
      //     return true;
      //     }else {
      //       console.log(msg);
      //     return msg;
      //     }
      //   })
   // console.log(this.midata.user.email);
    // checking if login sucesfull

    // console.log(this._midata.authToken);
    // console.log(this.midata.search('Observation'));
     this.getData();
  }

  logout() {
    this.midata.logout();
  }


  //Testing wie man an die daten vom Benutzer kommt
  /////////////////////////////////////////////////////////////
  getData() {
    const bundle = this.midata.search('Observation')
    const resources = [];

    bundle.then((msg) => {
      for (const key in msg) {
        //console.log(msg[key]);
          resources.push(msg[key]);
        }
    });

    console.log(resources);
  }
  ////////////////////////////////////////////////////////////////////////////////


  //Noch aus LC2 --> nicht sicher ob noch nützlich
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


  // TEST Phil
}
