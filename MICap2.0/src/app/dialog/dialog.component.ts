import { LoginComponent } from './../login/login.component';

import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styles: []
})
export class DialogComponent implements OnInit {


  constructor(public thisDialogref: MatDialogRef<LoginComponent>, @Inject(MAT_DIALOG_DATA) public data: string) { }

  ngOnInit() {
  }
  // Bestätigt dass der Benutzer das Fenster gesehen hat.
  onCloseConfirm(){
    this.thisDialogref.close(true);
  }
}
