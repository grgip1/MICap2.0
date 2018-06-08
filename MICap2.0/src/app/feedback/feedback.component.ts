import { AuthRequest } from './../../services/authentication';
import { Participant, Feedback } from './../../services/participant';
import { Component, OnInit } from '@angular/core';
import { Router, RouteConfigLoadEnd } from '@angular/router';
import { MidataConnection } from '../../services/MidataConnection';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { NgProgress } from 'ngx-progressbar';
import { MatDialog } from '@angular/material';

import { Dialog2Component } from './../dialog2/dialog2.component';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styles: []
})
export class FeedbackComponent implements OnInit {

  private REDCapToken: string = ''                          // REDCap-API-Token.
  private User: string;                                     // Name vom Nutzer.

  // Array mit den Patientennamen aus REDCap. Wird befüllt falls der Nutzer die Daten nicht pseudonymisiert sehen kann.
  private RedcapParticipants: Array<Participant> = [];      // Array mit allen Studienteilnehmern aus REDCap.
  private errorMessage: string;                             // Fehlermeldung welche beim Login auftritt.
  private showHint: boolean = true;                         // Wird benutzt um zu entscheiden ob der Hint engezeigt werden soll.
  private exportCount: number = 0;                              // Anzahl der zu exporierenden Rückmeldungen.
  private exporting: boolean = false;                       // Status ob MICap 2.0 am exportieren ist.
  private progressingCount: number = 0;                     // Anzahl der erledigten exports.
  private timer2 = Observable.interval(500).subscribe(      // Timer welcher überprüft ob ein REDCap-API-Token eingegeben wurde.
    () => {
      if (this.REDCapToken !== '') {
        this.showHint = false;
      } else {
        this.showHint = true
      }
    });

  private timerFeedback = Observable.interval(120000).subscribe( // Timer welcher die Rückmeldungen aus REDCap in einem bestimmten Zeitintervall holt.
    () => {
      if (!this.showHint) {
        this.getFeedback();
      }
    });



  constructor(private router: Router, private midata: MidataConnection, private http: Http, public dialog: MatDialog, private progress: NgProgress) {
  }

  /**
   * Beim starten dieser Komponente wird eine Verbindung zu REDCap hergestellt.
   * Die Anzahl der Patienten und der Rückmeldungen in der Studie werden ausgelesen.
   */
  ngOnInit() {

    // Überprüft ob der Nutzer angemeldet ist.
    if (this.midata._authToken == undefined) {
      this.router.navigate(['login']);
    }


    /**
     * Der Header mit dem authenticate-token wird erstellt.
     * Zu beachten ist, dass vor authenticate-token Bearer sein muss sonst funktioniert das authenticate nicht.
     */
    let headers = new Headers();
    headers.append('Authorization', 'Bearer ' + this.midata._authToken);
    const Options = new RequestOptions({ headers: headers });

    // Verbindung mit MIDATA um den Namen des Nutzer zu holen.
    this.http.get(this.midata.userNameURL + this.midata._user, Options).toPromise()
      .then(res => {
        const bundle = JSON.parse(res.text());
        console.log(bundle);
        this.User = bundle.name[0].family + ' ' + bundle.name[0].given[0];
        console.log(this.User);
      }
      );
  }

  // Navigiert zur Login-Komponente und setzt die Token auf undefiniert.
  logout() {
    // Notwendig falls während dem Ladens sich der Nutzer abmeldet.
    this.progress.done();

    this.exporting = false;
    this.progressingCount = 0;
    this.timerFeedback.unsubscribe();
    this.RedcapParticipants = [];
    this.midata._authToken = undefined;
    this.midata._refreshToken = undefined;
    this.router.navigate(['login']);
  }

  // Holt die Patienten aus REDCap.
  getREDCappariticpant() {
    const data = ({
      redcapAPIToken: this.REDCapToken
    });
    // Holt alle Studienteilnehmer aus REDCap und legt es in einem Array ab.
    this.http.post('http://localhost/dashboard/micap/redcap.participant.php', data).toPromise()
      .then(
        (res) => {
          const bundle = JSON.parse(res.text());

          // Fängt Fehlermeldung zum REDCap-API-Token ab.
          if (res.text() === '{"error":"You do not have permissions to use the API"}') {
            this.errorMessage = 'REDCap-API-Token ist inkorrekt!'
          }
          else {

            // Überprüft ob für für welche Patienten Rückmeldungen vorhanden sind.
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
        });
  }

  getFeedback() {
    const data = ({
      redcapAPIToken: this.REDCapToken
    });

    // Überprüft ob eine REDCap-API-Token eingegeben wurde. Falls kein Token vorhanden ist, wird ein Dialog-Fenster geöffnet.
    if ((this.REDCapToken === '')) {
      this.progress.done();
      let dialogRef = this.dialog.open(Dialog2Component, {
        width: '600px',
        data: 'Keinen REDCap-API-Token angegeben. Um den Datenexport einzuleiten bitte REDCap-API-Token eingeben!'
      });
      dialogRef.afterClosed().subscribe(res => {
        if (!res[1]) {
          this.REDCapToken = res[0];
        }
      });
      this.progress.done();
    } else {
      this.progress.start();
      this.exporting = true;
      this.getREDCappariticpant();
      let feedback: Array<Feedback> = [];
      this.http.post('http://localhost/dashboard/micap/redcap.feedback.php', data).toPromise()
        .then(res => {
          const bundle = JSON.parse(res.text());
           // Überprüft ob ein Fehler mit dem REDCap-API-Token aufgetreten ist.
          if (res.text() === '{"error":"You do not have permissions to use the API"}') {
            this.errorMessage = 'REDCap-API-Token ist inkorrekt!'
          } else {

            // Die Rückmeldungen werden in ein Array abgelegt.
            for (let key in bundle) {
              if (bundle[key].feedback !== '') {
                const Feedback: Feedback = { midatastudy_id: bundle[key].midatastudy_id, feedback: bundle[key].feedback }
                feedback.push(Feedback);
              }
            }
          }
        }).then(
          () => {
            this.exportCount = feedback.length;
            console.log(this.exporting);
            console.log(feedback);
            this.pushToMidata(feedback);
          }).then(
            () => {
              this.progress.done();
              this.exporting = false;
            });
    }
  }

  pushToMidata(feedback: Array<Feedback>) {
    let exist: boolean;          // Anzeige ob eine Communication-Ressource mit dem gleichen Inhalt an die gleiche Person gesendet wurde.
    let options: RequestOptions; // Autorisierung-Header für das Holen und senden von Communication-Ressourcen.

    // Meldet sich mit provider Konto micap2.0@bachelor.ch an. Über dieses Konto wird die Communication-Ressource gesendet.
    this.http.post(this.midata.authURL, this.midata.feedbackAuthRequest).toPromise()
      .then((res) => {
        const bundle = JSON.parse(res.text());

        let headers = new Headers();
        headers.append('Authorization', 'Bearer ' + bundle.authToken);
        options = new RequestOptions({ headers: headers });
      })
      // Hier Findet die Re-Identifikation statt. Die zwei Arrays Feedback und RedcapParticipant werden auf gleiche Studientielnehmer untersucht.
      .then(() => {
        for (let key in feedback) {
          let reIdentified;
          for (let i in this.RedcapParticipants) {

            // Wird überprüft ob bei beiden Arrays die gleiche Studienteilnehmer-ID vorkommt.
            if (feedback[key].midatastudy_id === this.RedcapParticipants[i].midatastudy_id) {

              let headers = new Headers();
              headers.append('Authorization', 'Bearer ' + this.midata._authToken);
              const Options = new RequestOptions({ headers: headers });

              // Falls die Studienteilnehmer-ID vor kommt wird MIDATA abgefragt wem die Test-ID gehört.
              this.http.get(this.midata.patientTestIDURL + this.RedcapParticipants[i].testId, Options).toPromise()
                .then(res => {
                  const bundle = JSON.parse(res.text());

                  // Re-identifizierter Patient.
                  reIdentified = bundle.entry[0].resource.subject.reference;

                  // CommunicationResource welche an den Patienten gesendet wird.
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

                  // Wird überprüft ob nicht schon eine Communication-Ressource mit dem gelichen Inhalt zum gleichen Patienten gesendet wurde.
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
                      // Sendet die Communication-Ressource an den re-identifizierten Patient.
                      if (!ex) {
                        this.http.post(this.midata.CommunicationURL, CommunicationResource, options).toPromise()
                          .then(res => {
                            console.log(res);
                            this.progressingCount++
                            console.log(this.progressingCount + ' ' + this.exportCount);
                            if (this.exportCount === this.progressingCount) {
                              this.progress.done();
                              this.exporting = false;
                            }
                          });
                      }
                    });
                });
            }
          }
        }
      });
  }
}
