import { AuthRequest } from './authentication';
import { Injectable } from '@angular/core';


@Injectable()
export class MidataConnection {

  public _authToken: string;    // Authentifikations-Token.
  public _refreshToken: string; // Refresh-Token.
  public _user: string;         // Benutzer welcher sich anmeldet.
  public _userName:string       // Name des angemeldeten Nutzers.
  public authURL = 'https://test.midata.coop/v1/auth'; // URL welcher aufgerufen wird um sich bei MIDATA anzumelden.
  public patientRequestURL = 'https://test.midata.coop/fhir/Patient/_search' // URL welcher aufgerufen wird, um nach Ressourcen vom Typ Patient zu suchen.
  public observationRequestURL = 'https://test.midata.coop/fhir/Observation/_search'// URL welcher aufgerufen wird, um nach Ressourcen vom Typ Observation zu suchen.
  public questionnaireRequestURL = 'https://test.midata.coop/fhir/QuestionnaireResponse/_search' // URL welcher aufgerufen wird, um nach Ressourcen vom Typ QuestionResponse zu suchen.
  public patientTestIDURL = 'https://test.midata.coop/fhir/Observation?_id=';
  public CommunicationURL = 'https://test.midata.coop/fhir/Communication';
  public userNameURL = 'https://test.midata.coop/fhir/Person/';
  public REDCapExportAppName = 'MICap2.0'; // Name vom MICap2.0-Plugins
  public AppSecret = 'Bsc2018'; // AppSecret beider Plugins
  public FeedbackAppName = 'Feedback'; // Name des Feedback-Plugins
  public PatientNumber: number;

  // Setzt Anmeldedten.
  setLogin(authtoken: string, refreshtoken: string, user: string){
    this._authToken = authtoken;
    this._refreshToken = refreshtoken;
    this._user = user;
  }

  public feedbackAuthRequest: AuthRequest = {
    username: 'micap2.0@bachelor.ch',
    password: 'MitrendsStudy18',
    appname: 'Feedback',
    secret: 'Bsc2018',
    device: 'debug',
    role: 'provider'
  };
}
