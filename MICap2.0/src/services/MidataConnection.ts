import { Midata } from 'Midata';
import { Injectable } from '@angular/core';
import { fromFhir } from 'Midata/dist/src/resources/registry';


@Injectable()
export class MidataConnection {

  private _midata: Midata;

  constructor() {
    this._midata = new Midata('https://test.midata.coop', 'MICap2.0', 'Bsc2018');
  }

  login(username, password) {
    this._midata.login(username, password, 'research');
    // this._midata.fetchFHIRConformanceStatement();
    console.log(this._midata.authToken);

  }

  createfhir(bundle: JSON) {

    const ressources = [];
    for (const key in bundle) {

      if ( !bundle.hasOwnProperty(key) // skip prototype extensions
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

}
