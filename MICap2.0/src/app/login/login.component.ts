import { NgModule, Component, OnInit, Pipe } from '@angular/core';
import { Router } from '@angular/router';
import { MidataConnection } from '../../services/MidataConnection';
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
  errorMessage: string;
  errorOccured: boolean;
  user: any;

  constructor(private router: Router, private midata: MidataConnection) {

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
      this.errorOccured = false;
      this.midata.login(this.username.value, this.password.value);
      this.user = this.midata.getUser();
      console.log(this.errorMessage);
      if (this.midata.errorOccured) {
        // location.reload();
        console.log('error coccured');
      } else {
        console.log('error not occured');
        // this.router.navigate(['home']);
      }

    }
  }

  toHome() {
    this.router.navigate(['home']);
  }
}

