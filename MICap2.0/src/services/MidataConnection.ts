import { Midata, resources, Resource, Bundle } from 'Midata';
import { Injectable } from '@angular/core';
import { fromFhir } from 'Midata/dist/src/resources/registry';


@Injectable()
export class MidataConnection {

  public errorOccured: boolean;
  public errorMessage: string;
  private midata: Midata;
  private allData: any;
  public user: string;
  public dataCount: number;

  constructor() {
    this.midata = new Midata('https://test.midata.coop', 'MICap2.0', 'Bsc2018');
  }

  login(username: string, password: string) {
    this.midata.login(username, password, 'research')
      .catch((err) => {
        this.errorOccured = true;
        const errmessage = JSON.parse(err.body);
        this.errorMessage = errmessage.message;
        console.log(errmessage.message);
      });
    this.user = this.midata.user.name;
    this.allData = this.midata.search('Observation');
  }

  logout() {
    this.midata.logout();
  }

  getDataCount() {
    return this.allData.size;
  }

  getUser() {
    return this.midata.user;
  }

  // Testing wie man an die daten vom Benutzer kommt
  /////////////////////////////////////////////////////////////
  private getData() {
    this.allData = this.midata.search('Observation');
    const bundle = this.midata.search('Observation');
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
}
