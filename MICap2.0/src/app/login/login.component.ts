import { NgModule, Component, OnInit, Pipe } from '@angular/core';
import { Router } from '@angular/router';
import { MidataConnection } from '../../services/MidataConnection';
import { Midata, resources, Resource, Bundle } from 'Midata';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {

  loginCredent: FormGroup;
  username: FormControl;
  password: FormControl;
  private midata: Midata;
  errorMessage: string;
  errorOccured: boolean;

  constructor(private router: Router) {
    this.midata = new Midata('https://test.midata.coop', 'MICap2.0', 'Bsc2018');
  }

  ngOnInit() {
    this.createFormControls();
    this.createForm();
  }

  createFormControls() {
    this.username = new FormControl('', Validators.required);
    this.password = new FormControl('', Validators.required);
  }

  createForm() {
    this.loginCredent = new FormGroup({
      username: this.username,
      password: this.password,
    });
  }

  login() {
    if (this.username.valid && this.password.valid) {
      this.midata.login(this.username.value, this.password.value, 'research')
        .catch((err) => {
          this.errorOccured = true;
          const errmessage = JSON.parse(err.body);
          this.errorMessage = errmessage.message;
          console.log(this.errorMessage, this.errorOccured);
        });
      console.log(this.errorMessage);
      if (this.errorOccured) {
        //location.reload();
        console.log('error coccured');
      } else {
        console.log('error not occured');
        this.errorOccured = false;
        this.router.navigate(['home']);
      }

    }
  }
}

