import { Dialog2Component } from './../dialog2/dialog2.component';
import { MatDialog } from '@angular/material';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MidataConnection } from '../../services/MidataConnection';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { NgProgress } from 'ngx-progressbar';

/**
 * Ermöglicht die Kommunikation zwischen MIDATA und REDCap.
 *
 * @export
 * @class HomeComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: []
})


export class HomeComponent implements OnInit {

  REDCapToken: string = '' // REDCap-API-Token.
  User: string;                                             // Name vom Nutzer.
  DataEntry: number = 0;                                    // Anzahl vorhandener Daten in der Studie.
  Patients: number = 0;                                     // Anzahl Patienten in der Studie.
  Options: RequestOptions;                                  // Autorisierung-Header für das Holen der Studiendaten.
  ErrorMessage: string;                                     // Text der Fehlermeldung.
  private errorMessage: string;                             // Fehlermeldung welche beim Login auftritt.
  private showHint: boolean = true;                         // Wird benutzt um zu entscheiden ob der Hint engezeigt werden soll.
  private exportCount: number;                              // Anzahl der zu exportierenden Daten
  private progressingCount: number = 0;                     // Zählt wie viele export gemacht wurden.
  private exporting: boolean = false;                       // Um zu wissen wann MICap 2.0 am exportieren ist.
  private timer = Observable.interval(300000).subscribe(    // Timer welcher den Export alle 5 Minuten auslöst falss ein API-Token vorhanden ist und MICap 2.0 nicht am Exportiren ist.
    () => {
      if(!this.showHint && !this.exporting){
        this.pushToRedCap();
      }
    });

  private timer2 = Observable.interval(500).subscribe(      // Timer welcher überprüft ob ein REDCap-API-Token eingegeben wurde.
    () => {
      if (this.REDCapToken !== '') {
      this.showHint = false;
      } else {
        this.showHint = true
      }
    });

  constructor(private router: Router, private midata: MidataConnection, private http: Http, public dialog: MatDialog, private progress: NgProgress) {
  }

  /**
   * Beim starten dieser Komponente wird eine Verbindung zu MIDATA hergestellt.
   * Die Anzahl der Patienten und der vorhanden Daten in der Studie werden ausgelesen.
   */
  ngOnInit() {

    // Überprüft ob der Nutzer angemeldet ist.
    if (this.midata._authToken == undefined) {
      this.router.navigate(['login']);
    }

    // Timer für das Überprüfen vom Hint wird gestartet.
    this.timer2;

    /**
     * Der Header mit dem authenticate-token wird erstellt.
     * Zu beachten ist, dass vor authenticate-token Bearer sein muss sonst funktioniert das authenticate nicht.
     */
    let headers = new Headers();
    headers.append('Authorization', 'Bearer ' + this.midata._authToken);
    this.Options = new RequestOptions({ headers: headers });
    this.Patients = this.midata.PatientNumber;

    // Anzahl Observations in der MIDATA-Studie.
    let numberObservations: number;

    // Anzahl Questionnaires in der MIDATA-Studie.
    let numberQuestionnaires: number;

    // Verbindung mit MIDATA um den Namen des Nutzer zu holen.
    this.http.get(this.midata.userNameURL + this.midata._user, this.Options).toPromise()
      .then(res => {
        const bundle = JSON.parse(res.text());
        this.User = bundle.name[0].family + ' ' + bundle.name[0].given[0];
      });

    // Anzahl der Observations wird abgefragt.
    this.http.get(this.midata.observationRequestURL, this.Options).toPromise()
      .then(res => {
        let bundle = JSON.parse(res.text());
        numberObservations = bundle.entry.length;
      })
      // Anzahl der Questionnaires wird abgefragt.
      .then(() => {
        this.http.get(this.midata.questionnaireRequestURL, this.Options).toPromise()
          .then(res => {
            let bundle = JSON.parse(res.text());
            numberQuestionnaires = bundle.entry.length;
          })
          // Summiert die Anzahl der Observation und Questionnaires und berechnet wie viele export notwendig sind.
          .then(() => {
            this.DataEntry = numberObservations + numberQuestionnaires;

            // Anzahl der nötigen Exports
            this.exportCount = numberObservations + (numberQuestionnaires * 3); // Mal 3 weil für jeden der 3 Fragebogen eine einzelne PHP-Datei ausgeführt wird.
            console.log(this.exportCount);
          });
      });
  }

  /**
   * Der Nutzer wird abgemeldet und die Timer werden beendet.
   */
  logout() {
    // Notwendig falls während dem Ladens sich der Nutzer abmeldet.
    this.progress.done();
    this.timer.unsubscribe();
    this.timer2.unsubscribe();
    this.midata._authToken = undefined;
    this.midata._refreshToken = undefined;
    this.router.navigate(['login']);
  }

  /**
   * Verbindet sich mit MIDATA und holt alle Observation- und QuestionnaireResponse-Ressourcen.
   * Die erhaltenen Ressourcen werden gefiltert und anschliessend nach REDCap exportiert.
   */
  pushToRedCap() {
    this.errorMessage ='';
    this.progressingCount = 0;
    this.progress.start();
    this.dialog.closeAll();

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
        console.log(`Token: ${res}`);
      });
    } else {
      this.exporting = true; // Das Programm weiss dann, dass es am Exportieren ist.
      let bundle: any; // Ressourcen-Bundle mit den Observations.

      /**
       * Verbindung zu MIDATA.
       * Die Methode toPromise() wird benötigt, um den Typ der Antwort des http von einem Observable in ein Promise umzuwandeln.
       * Die Antwort vom http wird in ein JSON umgewandelt und in die Variable bundle abgelegt.
       */
      this.http.get(this.midata.observationRequestURL, this.Options).toPromise()
        .then(res => {
          bundle = JSON.parse(res.text());
          console.log(bundle);

          /**
           * Um zu wissen wie viele Instrumentinstanzen angelegt werden müssen,
           * wird die Instanz immer inkrementiert wenn die MIDATA-Studientteilnehmer-ID gleichbleibt.
           * Ändert die MIDATA-Studientteilnehmer-ID, wird die Instrumentinstanzen auf 0 zurückgesetzt.
          */
          let labyrinthPaticipant: string;
          let labyrinthInstance: number = 0;
          let msdotParticipant: string;
          let msdotInstance: number = 0;
          let mslineParticipant: string;
          let mslineInstance: number = 0;
          let mssdParticipant: string;
          let mssdInstance: number = 0;

          // Durch das erhaltene und in JSON umgewandelte FHIR-Bundle wird durchiteriert die Tests rausgefiltert.
          for (let key in bundle.entry) {

            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Alle Labyrinth-Test-Einträge werden gefiltert und die Werte ausgelesen.
            if (bundle.entry[key].resource.code.coding[0].code === 'MSCogTestLab') {
              let Participant = bundle.entry[key].resource.meta.extension[0].extension[1].valueReference.display; // MIDATA-Studienteilnehmer-ID.
              let ID = bundle.entry[key].resource.id;                             // ID des Tests.
              let DateTime = bundle.entry[key].resource.effectiveDateTime;        // Datum und Uhrzeit der Erfassung des Tests.

              // Benötigte Daten aus dem Test MSCogTestLab.
              let TyrNb;
              let NbInverteredConnections;
              let NbErrors;
              let NbCorrections;
              let Score;
              let NbCorrectTries;
              let Duration;

              // Wenn die MIDATA-Studienteilnehmer-ID wechselt, wird die Instrumenteninstanz zurückgesetzt.
              if (labyrinthPaticipant !== Participant) {
                labyrinthInstance = 0;
              }

              // Die MIDATA-Studientteilnehmer-ID wird für den Test gesetzt um zu wissen wann der MIDATA-Studientteilnehmer ändert.
              labyrinthPaticipant = Participant;

              // Durch alle Komponente in der Ressource wird durchiteriert und die benötigten Daten ausgelesen.
              for (let comp in bundle.entry[key].resource.component) {
                if (bundle.entry[key].resource.component[comp].code.coding[0].code === 'TryNb') {
                  TyrNb = bundle.entry[key].resource.component[comp].valueQuantity.value;
                }
                if (bundle.entry[key].resource.component[comp].code.coding[0].code === 'NbInvertedConnections') {
                  NbInverteredConnections = bundle.entry[key].resource.component[comp].valueQuantity.value;
                }
                if (bundle.entry[key].resource.component[comp].code.coding[0].code === 'NbErrors') {
                  NbErrors = bundle.entry[key].resource.component[comp].valueQuantity.value;
                }
                if (bundle.entry[key].resource.component[comp].code.coding[0].code === 'NbCorrections') {
                  NbCorrections = bundle.entry[key].resource.component[comp].valueQuantity.value;
                }
                if (bundle.entry[key].resource.component[comp].code.coding[0].code === 'Score') {
                  Score = bundle.entry[key].resource.component[comp].valueQuantity.value;
                }
                if (bundle.entry[key].resource.component[comp].code.coding[0].code === 'NbCorrectTries') {
                  NbCorrectTries = bundle.entry[key].resource.component[comp].valueQuantity.value;
                }
                if (bundle.entry[key].resource.component[comp].code.coding[0].code === 'Duration') {
                  Duration = bundle.entry[key].resource.component[comp].valueQuantity.value;
                }
              }

              // Die Labyrinth-Instrumentinstanz wird inkrementiert.
              labyrinthInstance++;

              // Daten werden für den Übertrag zusammengefasst.
              const data = (
                {
                  midatastudy_id: Participant,
                  id: ID,
                  effectivedatetime: DateTime,
                  trynb: TyrNb,
                  nbinvertedconnections: NbInverteredConnections,
                  nberrors: NbErrors,
                  nbcorrections: NbCorrections,
                  score: Score,
                  nbcorrecttries: NbCorrectTries,
                  duration: Duration,
                  repeatInstance: labyrinthInstance,
                  redcapAPIToken: this.REDCapToken
                }
              );

              // Zum überprüfen in welche Instanz welche Daten gespeichert werden.
              // console.log(labyrinthInstance);
              // console.log(data);

              // Daten werden der zuständigen PHP-Datei übergeben, welche es in REDCap speichert.
              this.http.post('http://localhost/dashboard/micap/redcap.labyrinth.php', data).toPromise()
                .then(res => {
                  // Überprüft ob der Fehler wegen dem REDCap-API-Token aufgetreten ist.
                  if(res.text()=== '{"error":"You do not have permissions to use the API"}'){
                    this.errorMessage = 'REDCap-API-Token ist inkorrekt!'
                  }
                  this.progressingCount++;

                  // Falls die Exportnummer mit der berechneten Exportnummer übereinstimmt wird der Ladebalken beendet.
                  if (this.progressingCount === this.exportCount) {
                    this.exporting = false;
                    this.progress.done();
                  }
                });
            }
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Alle Punkte-Test-Einträge werden gefiltert und die Werte ausgelesen
            if (bundle.entry[key].resource.code.coding[0].code === 'MSMotTestDot') {
              let Participant = bundle.entry[key].resource.meta.extension[0].extension[1].valueReference.display; // MIDATA-Studienteilnehmer-ID.
              let ID = bundle.entry[key].resource.id;                              // ID des Tests.
              let dateTime = bundle.entry[key].resource.effectiveDateTime;         // Datum und Uhrzeit der Erfassung des Tests.
              let Bodysite = bundle.entry[key].resource.bodySite.coding[0].code;   // Welche Hand für den Test benutzt wurde.

              // Benötigte Daten aus dem Test MSMotTestDot.
              let Points;
              let Duration;

              // Wenn die MIDATA-Studienteilnehmer-ID wechselt, wird die Instrumenteninstanz zurückgesetzt.
              if (msdotParticipant !== Participant) {
                msdotInstance = 0;
              }

              // Die MIDATA-Studientteilnehmer-ID wird für den Test gesetzt um zu wissen wann der MIDATA-Studientteilnehmer ändert.
              msdotParticipant = Participant;

              // Durch alle Komponente in der Ressource wird durchiteriert und die benötigten Daten ausgelesen.
              for (let comp in bundle.entry[key].resource.component) {
                if (bundle.entry[key].resource.component[comp].code.coding[0].code === 'Points') {
                  Points = bundle.entry[key].resource.component[comp].valueQuantity.value;
                }
                if (bundle.entry[key].resource.component[comp].code.coding[0].code === 'Duration') {
                  Duration = bundle.entry[key].resource.component[comp].valueQuantity.value;
                }
              }

              // Die Punkte-Instrumentinstanz wird inkrementiert.
              msdotInstance++;

              // Daten für den Übertrag werden zusammengefasst.
              const data = (
                {
                  midatastudy_id: Participant,
                  id: ID,
                  effectivedatetime: dateTime,
                  hand: Bodysite,
                  points: Points,
                  duration: Duration,
                  repeatInstance: msdotInstance,
                  redcapAPIToken: this.REDCapToken
                }
              );

              // Zum überprüfen welche Daten in die Instrumenteninstanz gespeichert werden.
              // console.log(msdotInstance);
              // console.log(data);

              // Daten werden der zuständigen PHP-Datei übergeben, welche es in REDCap speichert.
              this.http.post('http://localhost/dashboard/micap/redcap.motpoint.php', data).toPromise().
                then(res => {

                  // Überprüft ob der Fehler wegen dem REDCap-API-Token aufgetreten ist.
                  if(res.text()=== '{"error":"You do not have permissions to use the API"}'){
                    this.errorMessage = 'REDCap-API-Token ist inkorrekt!'
                  }
                  this.progressingCount++;

                  // Falls die Exportnummer mit der berechneten Exportnummer übereinstimmt wird der Ladebalken beendet.
                  if (this.progressingCount === this.exportCount) {
                    this.exporting = false;
                    this.progress.done();
                  }
                });
            }
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Alle Linien-Test-Einträge werden gefiltert und die Werte ausgelesen.
            if (bundle.entry[key].resource.code.coding[0].code === 'MSMotTestLine') {
              let Participant = bundle.entry[key].resource.meta.extension[0].extension[1].valueReference.display; // MIDATA-Studienteilnehmer-ID.
              let ID = bundle.entry[key].resource.id;                             // ID des Tests.
              let DateTime = bundle.entry[key].resource.effectiveDateTime;        // Datum und Uhrzeit der Erfassung des Tests.
              let Bodysite = bundle.entry[key].resource.bodySite.coding[0].code;  // Welche Hand für den Test benutzt wurde.

              // Benötigte Daten aus dem Test MSMotTestLine.
              let LineNr;
              let Duration;
              let AvgDist;
              let StdDevDist;

              // Wenn die MIDATA-Studienteilnehmer-ID wechselt, wird die Instrumenteninstanz zurückgesetzt.
              if (mslineParticipant !== Participant) {
                mslineInstance = 0;
              }

              // Die MIDATA-Studientteilnehmer-ID wird für den Test gesetzt um zu wissen wann der MIDATA-Studientteilnehmer ändert.
              mslineParticipant = Participant;

              // Wird überprüft um welche Linie es sich Handelt. So wird dementsprechend die Liniennummer gesetzt.
              if (bundle.entry[key].resource.component[0].code.coding[0].code === 'L1_Duration') {
                LineNr = 1;
              }
              if (bundle.entry[key].resource.component[0].code.coding[0].code === 'L2_Duration') {
                LineNr = 2;
              }
              if (bundle.entry[key].resource.component[0].code.coding[0].code === 'L3_Duration') {
                LineNr = 3;
              }
              if (bundle.entry[key].resource.component[0].code.coding[0].code === 'L4_Duration') {
                LineNr = 4;
              }

              // Durch alle Komponente in der Ressource wird durchiteriert und die benötigten Daten ausgelesen.
              for (let comp in bundle.entry[key].resource.component) {
                if (bundle.entry[key].resource.component[comp].code.coding[0].code === 'L1_Duration' ||
                  bundle.entry[key].resource.component[comp].code.coding[0].code === 'L2_Duration' ||
                  bundle.entry[key].resource.component[comp].code.coding[0].code === 'L3_Duration' ||
                  bundle.entry[key].resource.component[comp].code.coding[0].code === 'L4_Duration') {
                  Duration = bundle.entry[key].resource.component[comp].valueQuantity.value;
                }
                if (bundle.entry[key].resource.component[comp].code.coding[0].code === 'L1_AvgDist' ||
                  bundle.entry[key].resource.component[comp].code.coding[0].code === 'L2_AvgDist' ||
                  bundle.entry[key].resource.component[comp].code.coding[0].code === 'L3_AvgDist' ||
                  bundle.entry[key].resource.component[comp].code.coding[0].code === 'L4_AvgDist') {
                  AvgDist = bundle.entry[key].resource.component[comp].valueQuantity.value;
                }
                if (bundle.entry[key].resource.component[comp].code.coding[0].code === 'L1_StdDevDist' ||
                  bundle.entry[key].resource.component[comp].code.coding[0].code === 'L2_StdDevDist' ||
                  bundle.entry[key].resource.component[comp].code.coding[0].code === 'L3_StdDevDist' ||
                  bundle.entry[key].resource.component[comp].code.coding[0].code === 'L4_StdDevDist') {
                  StdDevDist = bundle.entry[key].resource.component[comp].valueQuantity.value;
                }
              }

              // Die Linien-Instrumentinstanz wird inkrementiert.
              mslineInstance++;

              // Daten für den Übertrag werden zusammengefasst.
              const data = (
                {
                  midatastudy_id: Participant,
                  id: ID,
                  effectivedatetime: DateTime,
                  hand: Bodysite,
                  line: LineNr,
                  avgdist: AvgDist,
                  stddevdist: StdDevDist,
                  duration: Duration,
                  repeatInstance: mslineInstance,
                  redcapAPIToken: this.REDCapToken
                }
              );

              // Zum überprüfen welche Daten in die Instrumenteninstanz gespeichert werden.
              // console.log(mslineInstance)
              // console.log(data);

              // Daten werden der zuständigen PHP-Datei übergeben, welche es in REDCap speichert.
              this.http.post('http://localhost/dashboard/micap/redcap.motline.php', data).toPromise()
                .then(res => {

                  // Überprüft ob der Fehler wegen dem REDCap-API-Token aufgetreten ist.
                  if(res.text()=== '{"error":"You do not have permissions to use the API"}'){
                    this.errorMessage = 'REDCap-API-Token ist inkorrekt!'
                  }
                  this.progressingCount++;

                  // Falls die Exportnummer mit der berechneten Exportnummer übereinstimmt wird der Ladebalken beendet.
                  if (this.progressingCount === this.exportCount) {
                    this.exporting = false;
                    this.progress.done();
                  }
                });
            }
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Alle Symbol-Digit-Test-Einträge werden gefiltert und die Werte ausgelesen.
            if (bundle.entry[key].resource.code.coding[0].code === 'MSCogTestSD') {
              let Participant = bundle.entry[key].resource.meta.extension[0].extension[1].valueReference.display; // MIDATA-Studienteilnehmer-ID.
              let ID = bundle.entry[key].resource.id;                              // ID des Tests.
              let dateTime = bundle.entry[key].resource.effectiveDateTime;         // Datum und Uhrzeit der Erfassung des Tests.

              // Benötigte Daten aus dem Test MSCogTestSD.
              let ClickFrequencyPartResultsData;
              let ClickFrequencyPartResultsDimension;
              let ClickFrequencyPartResultsPeriod;
              let NbIncorrectPartResultsData;
              let NbIncorrectPartResultsDimension;
              let NbIncorrectPartResultsPeriod;
              let NbCorrectPartResultsData;
              let NbCorrectPartResultsDimension;
              let NbCorrectPartResultsPeriod;
              let NbTotalIncorrect;
              let NbTotalCorrect;

              // Wenn die MIDATA-Studienteilnehmer-ID wechselt, wird die Instrumenteninstanz zurückgesetzt.
              if (mssdParticipant !== Participant) {
                mssdInstance = 0;
              }

              // Die MIDATA-Studientteilnehmer-ID wird für den Test gesetzt um zu wissen wann der MIDATA-Studientteilnehmer ändert.
              mssdParticipant = Participant;

              // Durch alle Komponente in der Ressource wird durchiteriert und die benötigten Daten ausgelesen.
              for (let comp in bundle.entry[key].resource.component) {
                if (bundle.entry[key].resource.component[comp].code.coding[0].code === 'ClickFrequencyPartResults') {
                  ClickFrequencyPartResultsData = bundle.entry[key].resource.component[comp].valueSampledData.data;
                  ClickFrequencyPartResultsDimension = bundle.entry[key].resource.component[comp].valueSampledData.dimension;
                  ClickFrequencyPartResultsPeriod = bundle.entry[key].resource.component[comp].valueSampledData.period;
                }
                if (bundle.entry[key].resource.component[comp].code.coding[0].code === 'NbIncorrectPartResults') {
                  NbIncorrectPartResultsData = bundle.entry[key].resource.component[comp].valueSampledData.data;
                  NbIncorrectPartResultsDimension = bundle.entry[key].resource.component[comp].valueSampledData.dimension;
                  NbIncorrectPartResultsPeriod = bundle.entry[key].resource.component[comp].valueSampledData.period;
                }
                if (bundle.entry[key].resource.component[comp].code.coding[0].code === 'NbCorrectPartResults') {
                  NbCorrectPartResultsData = bundle.entry[key].resource.component[comp].valueSampledData.data;
                  NbCorrectPartResultsDimension = bundle.entry[key].resource.component[comp].valueSampledData.dimension;
                  NbCorrectPartResultsPeriod = bundle.entry[key].resource.component[comp].valueSampledData.period;
                }
                if (bundle.entry[key].resource.component[comp].code.coding[0].code === 'NbTotalIncorrect') {
                  NbTotalIncorrect = bundle.entry[key].resource.component[comp].valueQuantity.value;
                }
                if (bundle.entry[key].resource.component[comp].code.coding[0].code === 'NbTotalCorrect') {
                  NbTotalCorrect = bundle.entry[key].resource.component[comp].valueQuantity.value;
                }
              }

              // Die Symbol-Digit-Instrumentinstanz wird inkrementiert.
              mssdInstance++;

              // Deiese Antworten bestehen aus 3 verschiedenen Werten.
              // Diese Werte werden zu einem String zusammen gefasst und anschlissend dem Datenpacket übergeben.
              const ClickFrequencyPartResults = 'Daten: ' + ClickFrequencyPartResultsData + ', Dimension: ' + ClickFrequencyPartResultsDimension + ', Periode: ' + ClickFrequencyPartResultsPeriod;
              const NbIncorrectPartResults = 'Daten: ' + NbIncorrectPartResultsData + ', Dimension: ' + NbIncorrectPartResultsDimension + ', Periode: ' + NbIncorrectPartResultsPeriod;
              const NbCorrectPartResults = 'Daten: ' + NbCorrectPartResultsData + ', Dimension: ' + NbCorrectPartResultsDimension + ', Periode: ' + NbCorrectPartResultsPeriod;

              // Daten für den Übertrag werden zusammengefasst.
              const data = (
                {
                  midatastudy_id: Participant,
                  id: ID,
                  effectivedatetime: dateTime,
                  clickfrequencypartresults: ClickFrequencyPartResults,
                  nbincorrectpartresults: NbIncorrectPartResults,
                  nbcorrectpartresults: NbCorrectPartResults,
                  nbtotalincorrect: NbTotalIncorrect,
                  nbtotalcorrect: NbTotalCorrect,
                  repeatInstance: mssdInstance,
                  redcapAPIToken: this.REDCapToken
                }
              );

              // Zum überprüfen welche Daten in die Instrumenteninstanz gespeichert werden.
              // console.log(mssdInstance);
              // console.log(data);

              // Daten werden der zuständigen PHP-Datei übergeben, welche es in REDCap speichert.
              this.http.post('http://localhost/dashboard/micap/redcap.digitsymb.php', data).toPromise()
                .then(res => {

                  // Überprüft ob der Fehler wegen dem REDCap-API-Token aufgetreten ist.
                  if(res.text()=== '{"error":"You do not have permissions to use the API"}'){
                    this.errorMessage = 'REDCap-API-Token ist inkorrekt!'
                  }
                  this.progressingCount++;

                  // Falls die Exportnummer mit der berechneten Exportnummer übereinstimmt wird der Ladebalken beendet.
                  if (this.progressingCount === this.exportCount) {
                    this.exporting = false;
                    this.progress.done();
                  }
                });
            }
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          }
        }) //Nun werden die Fragebögen bearbeitet.
        .then(() => {

          /**
           * Die Fragebögen gehören nicht zum Ressourcentyp Observables.
           * Deswergen muss noch eine MIDATA-Abfrage gemacht jedoch auf den Ressourcentyp QuestionnaireResponse.
           */
          this.http.get(this.midata.questionnaireRequestURL, this.Options).toPromise()
            .then(res => {

              // Das Ressourcenbundle wird in das JSON-Format umgewandelt.
              let bundle = JSON.parse(res.text());
              console.log(bundle);

              /**
               * Um zu wissen wie viele Instrumentinstanzen angelegt werden müssen,
               * wird die Instanz immer inkrementiert wenn die MIDATA-Studientteilnehmer-ID gleichbleibt.
               * Ändert die MIDATA-Studientteilnehmer-ID, wird die Instrumentinstanzen auf 0 zurückgesetzt.
               * Pro Fragebogen wird eine Instanzvariable geführt.
               */
              let questionnaireParticipant: string;
              let mainQuestionnaireInstance: number = 0;
              let msisQuestionnaireInstance: number = 0;
              let fatigueQuestionnaireInstance: number = 0;

              /**
               * Durch das erhaltene und in JSON umgewandelte FHIR-Bundle wird durchiteriert die Fragebögen rausgefiltert.
               * Weil die Antworten der Fragebögen verschachtelt in Items abgelegt sind, werden mehrere for-Schlaufen benötigt.
               */
              for (let key in bundle.entry) {

                // Schlaufe um durch die Fragebögen zu gehen.
                for (let item in bundle.entry[key].resource.item) {
                  let Participant = bundle.entry[key].resource.meta.extension[0].extension[1].valueReference.display;
                  let ID = bundle.entry[key].resource.id;
                  let dateTime = bundle.entry[key].resource.authored

                  // Antworten des MainSymptoms-Fragebogen.
                  let answer1_1, answer1_2, answer1_3, answer1_4, answer1_5, answer1_6, answer1_7, answer1_8, answer1_9

                  // Antworten des MSIS-Fragebogens.
                  let answer2_1, answer2_2, answer2_3, answer2_4, answer2_5, answer2_6, answer2_7, answer2_8, answer2_9, answer2_10,
                    answer2_11, answer2_12, answer2_13, answer2_14, answer2_15, answer2_16, answer2_17, answer2_18, answer2_19, answer2_20,
                    answer2_21, answer2_22, answer2_23, answer2_24, answer2_25, answer2_26, answer2_27, answer2_28, answer2_29;

                  // Antworten des FatigueSeverityScale-Fragebogens.
                  let answer3_1, answer3_2, answer3_3, answer3_4, answer3_5, answer3_6, answer3_7, answer3_8, answer3_9

                  // Wenn die MIDATA-Studienteilnehmer-ID wechselt, werden alle Instrumenteninstanzen zurückgesetzt.
                  if (questionnaireParticipant !== Participant) {
                    mainQuestionnaireInstance = 0;
                    msisQuestionnaireInstance = 0;
                    fatigueQuestionnaireInstance = 0;
                  }

                  // Die MIDATA-Studientteilnehmer-ID wird für den Test gesetzt um zu wissen wann der MIDATA-Studientteilnehmer ändert.
                  questionnaireParticipant = Participant;

                  // Schleife um durch die Antworten der Fragebögen zu gehen.
                  for (let item2 in bundle.entry[key].resource.item[item].item) {

                    // Durch alle Items (Antworten) in der Items (Fragebögen) wird durchiteriert und die benötigten Daten ausgelesen.
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '1.1') {
                      answer1_1 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '1.2') {
                      answer1_2 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '1.3') {
                      answer1_3 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '1.4') {
                      answer1_4 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '1.5') {
                      answer1_5 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '1.6') {
                      answer1_6 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '1.7') {
                      answer1_7 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '1.8') {
                      answer1_8 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '1.9') {
                      answer1_9 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '1.1') {
                      answer1_1 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '1.2') {
                      answer1_2 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '1.3') {
                      answer1_3 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '1.4') {
                      answer1_4 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '1.5') {
                      answer1_5 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '1.6') {
                      answer1_6 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '1.7') {
                      answer1_7 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '1.8') {
                      answer1_8 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '1.9') {
                      answer1_9 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.1') {
                      answer2_1 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.2') {
                      answer2_2 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.3') {
                      answer2_3 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.4') {
                      answer2_4 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.5') {
                      answer2_5 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.6') {
                      answer2_6 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.7') {
                      answer2_7 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.8') {
                      answer2_8 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.9') {
                      answer2_9 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.10') {
                      answer2_10 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.11') {
                      answer2_11 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.12') {
                      answer2_12 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.13') {
                      answer2_13 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.14') {
                      answer2_14 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.15') {
                      answer2_15 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.16') {
                      answer2_16 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.17') {
                      answer2_17 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.18') {
                      answer2_18 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.19') {
                      answer2_19 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.20') {
                      answer2_20 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.21') {
                      answer2_21 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.22') {
                      answer2_22 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.23') {
                      answer2_23 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.24') {
                      answer2_24 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.25') {
                      answer2_25 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.26') {
                      answer2_26 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.27') {
                      answer2_27 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.28') {
                      answer2_28 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '2.29') {
                      answer2_29 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '3.1') {
                      answer3_1 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '3.2') {
                      answer3_2 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '3.3') {
                      answer3_3 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '3.4') {
                      answer3_4 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '3.5') {
                      answer3_5 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '3.6') {
                      answer3_6 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '3.7') {
                      answer3_7 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '3.8') {
                      answer3_8 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                    if (bundle.entry[key].resource.item[item].item[item2].linkId === '3.9') {
                      answer3_9 = bundle.entry[key].resource.item[item].item[item2].answer[0].valueString;
                    }
                  }

                  // Prüft um welchen Fragebogen es sich handelt und fährt dementsprechend weiter.
                  if (bundle.entry[key].resource.item[item].linkId === '1') {

                    // Die MainSympoms-Instrumentinstanz wird inkrementiert.
                    mainQuestionnaireInstance++;

                    // Daten für den Übertrag werden zusammengefasst.
                    const data1 = (
                      {
                        midatastudy_id: questionnaireParticipant,
                        id: ID,
                        effectivedatetime: dateTime,
                        q1_1: answer1_1,
                        q1_2: answer1_2,
                        q1_3: answer1_3,
                        q1_4: answer1_4,
                        q1_5: answer1_5,
                        q1_6: answer1_6,
                        q1_7: answer1_7,
                        q1_8: answer1_8,
                        q1_9: answer1_9,
                        repeatInstance: mainQuestionnaireInstance,
                        redcapAPIToken: this.REDCapToken
                      }
                    );

                    // Zum überprüfen welche Daten in die Instrumenteninstanz gespeichert werden.
                    console.log(mainQuestionnaireInstance);
                    console.log(data1);

                    // Daten werden der zuständigen PHP-Datei übergeben, welche es in REDCap speichert.
                    this.http.post('http://localhost/dashboard/micap/redcap.mainsymptoms.php', data1).toPromise()
                      .then(res => {

                        // Überprüft ob der Fehler wegen dem REDCap-API-Token aufgetreten ist.
                        if(res.text()=== '{"error":"You do not have permissions to use the API"}'){
                          this.errorMessage = 'REDCap-API-Token ist inkorrekt!'
                        }
                        this.progressingCount++;

                        // Falls die Exportnummer mit der berechneten Exportnummer übereinstimmt wird der Ladebalken beendet.
                        if (this.progressingCount === this.exportCount) {
                          this.exporting = false;
                          this.progress.done();
                        }
                      });
                  } else if (bundle.entry[key].resource.item[item].linkId === '2') {

                    // Die MSIS-Instrumentinstanz wird inkrementiert.
                    msisQuestionnaireInstance++;

                    // Daten für den Übertrag werden zusammengefasst.
                    const data2 = (
                      {
                        midatastudy_id: questionnaireParticipant,
                        id: ID,
                        effectivedatetime: dateTime,
                        q2_1: answer2_1,
                        q2_2: answer2_2,
                        q2_3: answer2_3,
                        q2_4: answer2_4,
                        q2_5: answer2_5,
                        q2_6: answer2_6,
                        q2_7: answer2_7,
                        q2_8: answer2_8,
                        q2_9: answer2_9,
                        q2_10: answer2_10,
                        q2_11: answer2_11,
                        q2_12: answer2_12,
                        q2_13: answer2_13,
                        q2_14: answer2_14,
                        q2_15: answer2_15,
                        q2_16: answer2_16,
                        q2_17: answer2_17,
                        q2_18: answer2_18,
                        q2_19: answer2_19,
                        q2_20: answer2_20,
                        q2_21: answer2_21,
                        q2_22: answer2_22,
                        q2_23: answer2_23,
                        q2_24: answer2_24,
                        q2_25: answer2_25,
                        q2_26: answer2_26,
                        q2_27: answer2_27,
                        q2_28: answer2_28,
                        q2_29: answer2_29,
                        repeatInstance: msisQuestionnaireInstance,
                        redcapAPIToken: this.REDCapToken
                      }
                    );

                    // Zum überprüfen welche Daten in die Instrumenteninstanz gespeichert werden.
                    console.log(msisQuestionnaireInstance);
                    console.log(data2);

                    // Daten werden der zuständigen PHP-Datei übergeben, welche es in REDCap speichert.
                    this.http.post('http://localhost/dashboard/micap/redcap.msis.php', data2).toPromise()
                      .then(res => {

                        // Überprüft ob der Fehler wegen dem REDCap-API-Token aufgetreten ist.
                        if(res.text()=== '{"error":"You do not have permissions to use the API"}'){
                          this.errorMessage = 'REDCap-API-Token ist inkorrekt!'
                        }
                        this.progressingCount++;

                        // Falls die Exportnummer mit der berechneten Exportnummer übereinstimmt wird der Ladebalken beendet.
                        if (this.progressingCount === this.exportCount) {
                          this.exporting = false;
                          this.progress.done();
                        }
                      });

                  } else if (bundle.entry[key].resource.item[item].linkId === '3') {

                    // Die FatigueSeverityScale-Instrumentinstanz wird inkrementiert.
                    fatigueQuestionnaireInstance++;

                    // Daten für den Übertrag werden zusammengefasst.
                    const data3 = (
                      {
                        midatastudy_id: questionnaireParticipant,
                        id: ID,
                        effectivedatetime: dateTime,
                        q3_1: answer3_1,
                        q3_2: answer3_2,
                        q3_3: answer3_3,
                        q3_4: answer3_4,
                        q3_5: answer3_5,
                        q3_6: answer3_6,
                        q3_7: answer3_7,
                        q3_8: answer3_8,
                        q3_9: answer3_9,
                        repeatInstance: fatigueQuestionnaireInstance,
                        redcapAPIToken: this.REDCapToken
                      }
                    );

                    // Zum überprüfen welche Daten in die Instrumenteninstanz gespeichert werden.
                    // console.log(fatigueQuestionnaireInstance);
                    // console.log(data3);

                    // Daten werden der zuständigen PHP-Datei übergeben, welche es in REDCap speichert.
                    this.http.post('http://localhost/dashboard/micap/redcap.fatigue.php', data3).toPromise()
                      .then(res => {

                        // Überprüft ob der Fehler wegen dem REDCap-API-Token aufgetreten ist.
                        if(res.text()=== '{"error":"You do not have permissions to use the API"}'){
                          this.errorMessage = 'REDCap-API-Token ist inkorrekt!'
                        }
                        this.progressingCount++;

                        // Falls die Exportnummer mit der berechneten Exportnummer übereinstimmt wird der Ladebalken beendet.
                        if (this.progressingCount == this.exportCount) {
                          this.exporting = false;
                          this.progress.done();
                        }
                      });
                  }
                }
              }
            }
            )
        });//then für fragebögen
    }//else API-Token
  }//pushToRedCap
}//
