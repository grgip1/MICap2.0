import { Component, OnInit } from '@angular/core';
import { Router, RouteConfigLoadEnd } from '@angular/router';
import { MidataConnection } from '../../services/MidataConnection';
import { Http, RequestOptions, Headers} from '@angular/http';


@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styles: []
})
export class FeedbackComponent implements OnInit {

  REDCapToken: string = 'Keinen REDCap-API-Token angegeben' // REDCap-API-Token.
  User: any;                                                // Welcher User eingeloggt ist.
  DataEntry: number;                                        // Anzahl vorhandener Daten in der Studie.
  Patients: number;                                         // Anzahl Patienten in der Studie.
  Options: RequestOptions;                                  // Autorisierung-Header für das Holen der Studiendaten.
  ErrorOccured: boolean;                                    // Zum erkennen ob Fehler aufgetaucht sind.
  ErrorMessage: string;                                     // Text der Fehlermeldung.
  ReportID: string;                                         // ID des REDCap-Reports, welcher die Rückmeldungen ausgibt

  constructor(private router: Router, private midata: MidataConnection, private http: Http){
  }

  ngOnInit() {
   console.log(this.midata._authToken);
   if(this.midata._authToken == undefined){
     this.router.navigate(['login']);
   }

    /**
     * Der Header mit dem authenticate-token wird erstellt.
     * Zu beachten ist, dass vor authenticate-token Bearer sein muss sonst funktioniert das authenticate nicht.
     */
    let headers = new Headers();
    headers.append('Authorization', 'Bearer ' + this.midata._authToken);
    this.Options = new RequestOptions({ headers: headers });

    // Verbindung mit MIDATA und herauslesen wie viele Patienten in der Studie sind und der User wird gesetzt
    // TODO: user nicht schön muss sich noch ändern!!
    this.http.get(this.midata.patientRequest, this.Options).toPromise()
      .then(res => {
        const bundle = JSON.parse(res.text());
        console.log(bundle);
        this.Patients = bundle.total;
        this.User = this.midata._user;
        console.log(this.midata._authToken);
      }
      );
  }

  // Navigiert zur Login-Komponente und setzt die Token auf undefiniert.
  logout() {
    this.midata._authToken=undefined;
    this.midata._refreshToken=undefined;
    this.router.navigate(['login']);
  }

  save(token: string) {
    console.log(token);
    this.REDCapToken = token;
  }

  getFeedback(){
  this.http.get(''/*REDCap-PHP,*/).toPromise()
  .then(res => {console.log(res)});
  }



}
