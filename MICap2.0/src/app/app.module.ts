import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes, RouterOutlet } from '@angular/router';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatButtonModule} from '@angular/material';
import { AppRoutingModule, routingComponents } from './app-routing.modules';
import { MidataConnection } from '../services/MidataConnection';
import { NgProgressModule } from 'ngx-progressbar';


import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { DialogComponent } from './dialog/dialog.component';
import { Dialog2Component } from './dialog2/dialog2.component';


@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    FeedbackComponent,
    DialogComponent,
    Dialog2Component,
  ],
  imports: [
    BrowserModule,
    RouterModule,
    AppRoutingModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
    BrowserAnimationsModule,
    NgProgressModule,
  ],
  exports: [
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
  ],
  entryComponents: [
    DialogComponent,
    Dialog2Component,
  ],
  providers: [
    AppComponent,
    MidataConnection,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
