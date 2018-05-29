import { Injectable } from '@angular/core';


@Injectable()
export class MidataConnection {

  public _authToken: string;
  public _refreshToken: string;
  public _user: string;
  public user: string;
  public authURL = 'https://test.midata.coop/v1/auth';
  public patientRequest = 'https://test.midata.coop/fhir/Patient/_search'
  public observationRequest = 'https://test.midata.coop/fhir/Observation/_search'
  public questionnaireRequest = 'https://test.midata.coop/fhir/QuestionnaireResponse/_search'
  public appName = 'MICap2.0';
  public appSecret = 'Bsc2018';
  public authorization = 'Bearer ' + this._authToken;





  setLogin(authtoken: string, refreshtoken: string, user: string){
    this._authToken = authtoken;
    this._refreshToken = refreshtoken;
    this._user = user;
  }



}
