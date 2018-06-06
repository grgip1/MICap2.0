import { HomeComponent } from './../home/home.component';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styles: []
})
export class DialogComponent implements OnInit {


  constructor(public thisDialogref: MatDialogRef<HomeComponent>, @Inject(MAT_DIALOG_DATA) public data: string) { }

  ngOnInit() {
    //this.changePosition();
  }

  onCloseConfirm(){
    this.thisDialogref.close('Bestätigt');
  }

  onCloseCancel(){
    this.thisDialogref.close('Abgebrochen');
  }

//   changePosition() {
//     this.thisDialogref.updatePosition({  });
// }

}
