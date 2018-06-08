import { HomeComponent } from './../home/home.component';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';


@Component({
  selector: 'app-dialog2',
  templateUrl: './dialog2.component.html',
  styles: []
})
export class Dialog2Component implements OnInit {

  constructor(public thisDialogref: MatDialogRef<HomeComponent>, @Inject(MAT_DIALOG_DATA) public data: string) { }

  ngOnInit() {
  }

  onCloseConfirm(token: string){
    this.thisDialogref.close([token, false]);
  }

  onCloseCancel(){
    this.thisDialogref.close(['', true]);
  }

}
