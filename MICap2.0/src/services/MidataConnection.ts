import { Injectable } from '@angular/core';


@Injectable()
export class MidataConnection {

  public _authToken: string;    // Authentifikations-Token.
  public _refreshToken: string; // Refresh-Token.
  public _user: string;         // Benutzer welcher sich anmeldet.
  public authURL = 'https://test.midata.coop/v1/auth'; // URL welcher aufgerufen wird um sich bei MIDATA anzumelden.
  public patientRequest = 'https://test.midata.coop/fhir/Patient/_search' // URL welcher aufgerufen wird, um nach Ressourcen vom Typ Patient zu suchen.
  public observationRequest = 'https://test.midata.coop/fhir/Observation/_search'// URL welcher aufgerufen wird, um nach Ressourcen vom Typ Observation zu suchen.
  public questionnaireRequest = 'https://test.midata.coop/fhir/QuestionnaireResponse/_search' // URL welcher aufgerufen wird, um nach Ressourcen vom Typ QuestionResponse zu suchen.
  public appName = 'MICap2.0'; // TODO: wird es noch gebraucht??
  public appSecret = 'Bsc2018'; // TODO: wird es noch gebraucht??
  public authorization = 'Bearer ' + this._authToken; // TODO: wird es noch gebraucht??

  // Setzt Anmeldedten.
  setLogin(authtoken: string, refreshtoken: string, user: string){
    this._authToken = authtoken;
    this._refreshToken = refreshtoken;
    this._user = user;
  }



}
