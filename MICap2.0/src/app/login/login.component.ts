import { NgModule, Component, OnInit, Pipe } from '@angular/core';
import { Router } from '@angular/router';
import { MidataConnection } from '../../services/MidataConnection';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'login-form',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {

  loginCredent: FormGroup;
  username: FormControl;
  password: FormControl;
  errorMessage: string;

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
      if (this.username.valid && this.password.valid){
        this.midata.login(this.username.value, this.password.value);

      }

      if(this.midata.errorOccured){
        this.errorMessage = this.midata.errorMessage;
      } else{
        //this.router.navigate(['home']);
      }
    }

  goToHome() {

  }



}
