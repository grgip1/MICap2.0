import { AuthRequest } from './../../services/authentication';
import { Participant, Feedback } from './../../services/participant';
import { Component, OnInit } from '@angular/core';
import { Router, RouteConfigLoadEnd } from '@angular/router';
import { MidataConnection } from '../../services/MidataConnection';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';



@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styles: []
})
export class FeedbackComponent implements OnInit {

  REDCapToken: string = 'Keinen REDCap-API-Token angegeben' // REDCap-API-Token.
  User: string;                                             // Welcher User eingeloggt ist.
  RedcapParticipants: Array<Participant> = [];              // Array mit allen Studienteilnehmer in REDCap;
  timer = Observable.interval(5000).subscribe(() => { this.getFeedback(); });
  private errorOccured: boolean;                            // Indikator dass ein Fehler aufgetreten ist.
  private errorMessage: string;                             // Fehlermeldung welche beim Login auftritt.
  private showHint: boolean;


  constructor(private router: Router, private midata: MidataConnection, private http: Http) {
    if (this.REDCapToken !== 'Keinen REDCap-API-Token angegeben') {
      this.getREDCappariticpant();
      this.timer;
    }
  }

  ngOnInit() {
    // Überprüft ob der Nutzer angemeldet ist.
    if (this.midata._authToken == undefined) {
      this.router.navigate(['login']);
    }

    if (this.REDCapToken === 'Keinen REDCap-API-Token angegeben'){
      this.showHint = true;
    }

    let headers = new Headers();
    headers.append('Authorization', 'Bearer ' + this.midata._authToken);
    const Options = new RequestOptions({ headers: headers });

    // Verbindung mit MIDATA um den Namen des Nutzer zu holen.
    this.http.get(this.midata.userNameURL+this.midata._user, Options).toPromise()
      .then(res => {
        const bundle = JSON.parse(res.text());
        console.log(bundle);
        this.User = bundle.name[0].family +' '+ bundle.name[0].given[0];
        console.log(this.User);
      }
      );
  }

  // Navigiert zur Login-Komponente und setzt die Token auf undefiniert.
  logout() {
    this.timer.unsubscribe();
    this.midata._authToken = undefined;
    this.midata._refreshToken = undefined;
    this.router.navigate(['login']);
  }

  save(token: string) {
    this.errorOccured = false;
    if(token === undefined){
      this.errorOccured = true;
      this.errorMessage = 'Ungültiger REDCap-API-Token! Bitte eine gültigen REDCap-API-Token eingeben';
    }
    this.showHint = false;
    this.REDCapToken = token;
    this.getREDCappariticpant();
  }

  getREDCappariticpant() {
    const data = ({
      redcapAPIToken: this.REDCapToken
    })

    if (this.REDCapToken != 'Keinen REDCap-API-Token angegeben') {
      // Holt alle Studienteilnehmer aus REDCap und legt es in einem Array ab.
      this.http.post('http://localhost/dashboard/micap/redcap.participant.php', data).toPromise()
        .then(
          (res) => {
            const bundle = JSON.parse(res.text());
            if (bundle.error) {
              this.errorOccured = true;
              if (bundle.error === 'You do not have permissions to use the API') {
                this.errorMessage = 'Ungültiger REDCap-API-Token! Bitte eine gültigen REDCap-API-Token eingeben';
              }
              console.log(bundle.error);
            } else {
              this.errorOccured = false;

              console.log(bundle);
              for (let key in bundle) {
                if (bundle[key].id1 !== '') {
                  const participant: Participant = { midatastudy_id: bundle[key].midatastudy_id, testId: bundle[key].id1 }
                  let inside: boolean = false;
                  for (let i in this.RedcapParticipants) {
                    if (this.RedcapParticipants[i].midatastudy_id === participant.midatastudy_id) {
                      inside = true;
                    }
                  }
                  if (!inside) {
                    this.RedcapParticipants.push(participant);
                  }
                } else if (bundle[key].id2 !== '') {
                  const participant: Participant = { midatastudy_id: bundle[key].midatastudy_id, testId: bundle[key].id2 }
                  let inside: boolean = false;
                  for (let i in this.RedcapParticipants) {
                    if (this.RedcapParticipants[i].midatastudy_id === participant.midatastudy_id) {
                      inside = true;
                    }
                  }
                  if (!inside) {
                    this.RedcapParticipants.push(participant);
                  }
                } else if (bundle[key].id3 !== '') {
                  const participant: Participant = { midatastudy_id: bundle[key].midatastudy_id, testId: bundle[key].id3 }
                  let inside: boolean = false;
                  for (let i in this.RedcapParticipants) {
                    if (this.RedcapParticipants[i].midatastudy_id === participant.midatastudy_id) {
                      inside = true;
                    }
                  }
                  if (!inside) {
                    this.RedcapParticipants.push(participant);
                  }
                } else if (bundle[key].id4 !== '') {
                  const participant: Participant = { midatastudy_id: bundle[key].midatastudy_id, testId: bundle[key].id4 }
                  let inside: boolean = false;
                  for (let i in this.RedcapParticipants) {
                    if (this.RedcapParticipants[i].midatastudy_id === participant.midatastudy_id) {
                      inside = true;
                    }
                  }
                  if (!inside) {
                    this.RedcapParticipants.push(participant);
                  }
                }
              }
            }
          }).then(() => console.log(this.RedcapParticipants));
    }
  }

  getFeedback() {

    const data = ({
      redcapAPIToken: this.REDCapToken
    });

    if (this.REDCapToken != 'Keinen REDCap-API-Token angegeben') {
      let feedback: Array<Feedback> = [];
      this.http.post('http://localhost/dashboard/micap/redcap.feedback.php', data).toPromise()
        .then(res => {
          const bundle = JSON.parse(res.text());
          if (bundle.error) {
            this.errorOccured = true;
            if (bundle.error === 'You do not have permissions to use the API') {
              this.errorMessage = 'Ungültiger REDCap-API-Token! Bitte eine gültigen REDCap-API-Token eingeben';
            }
            console.log(bundle.error);
          } else {
            this.errorOccured = false;
            for (let key in bundle) {
              if (bundle[key].feedback !== '') {
                const Feedback: Feedback = { midatastudy_id: bundle[key].midatastudy_id, feedback: bundle[key].feedback }
                feedback.push(Feedback);
              }
            }
          }
        }

        ).then(() => {
          this.pushToMidata(feedback)
        });
    }
  }

  pushToMidata(feedback: Array<Feedback>) {
    let exist: boolean;
    let options: RequestOptions; // Autorisierung-Header für das Holen der Studiendaten.

    this.http.post(this.midata.authURL, this.midata.feedbackAuthRequest).toPromise()
      .then((res) => {
        const bundle = JSON.parse(res.text());

        let headers = new Headers();
        headers.append('Authorization', 'Bearer ' + bundle.authToken);
        options = new RequestOptions({ headers: headers });
      }).then(() => {
        for (let key in feedback) {
          let reIdentified;
          for (let i in this.RedcapParticipants) {
            if (feedback[key].midatastudy_id === this.RedcapParticipants[i].midatastudy_id) {

              let headers = new Headers();
              headers.append('Authorization', 'Bearer ' + this.midata._authToken);
              const Options = new RequestOptions({ headers: headers });

              this.http.get(this.midata.patientTestIDURL + this.RedcapParticipants[i].testId, Options).toPromise()
                .then(res => {
                  const bundle = JSON.parse(res.text());

                  // console.log(bundle);
                  reIdentified = bundle.entry[0].resource.subject.reference;


                  const CommunicationResource = {
                    resourceType: 'Communication',
                    status: 'completed',
                    recipient: [
                      {
                        reference: 'Patient/' + reIdentified,
                        type: 'Patient'
                      }
                    ],
                    payload: [
                      {
                        contentString: feedback[key].feedback
                      }
                    ]
                  }

                  this.http.get(this.midata.CommunicationURL, options).toPromise()
                    .then(res => {
                      let ex: boolean = false;
                      const bundle = JSON.parse(res.text());
                      for (let key in bundle.entry) {
                        if (bundle.entry[key].resource.recipient[0].reference === CommunicationResource.recipient[0].reference &&
                          bundle.entry[key].resource.payload[0].contentString === CommunicationResource.payload[0].contentString) {
                          ex = true;
                        }
                      }

                      if (!ex) {
                        this.http.post(this.midata.CommunicationURL, CommunicationResource, options).toPromise()
                          .then(res => console.log(res));
                      }
                    });
                });
            }
          }
        }
      });
  }

  ///////////////////////////////////////
  // zum speichern vom API TOKEN
  // let CommunicationResource = {
  //   resourceType: "Observation",
  //   status: "preliminary",
  //   code: {
  //     coding: [
  //       {
  //         system: "http://loinc.org",
  //         code: "	11488-4",
  //         display: "Rückmeldung"
  //       }
  //     ]
  //   },
  //   valueString: feedback[key].feedback
  // }
  /////////////////////////////
}
