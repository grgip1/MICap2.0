import { Injectable } from '@angular/core';


@Injectable()
export class MidataConnection {

  public _authToken: string;
  public _refreshToken: string;
  public _user: string;
  public user: string;
  public authURL = 'https://test.midata.coop/v1/auth';
  public appName = 'MICap2.0';
  public appSecret = 'Bsc2018';
  public authorization = 'Bearer ' + this._authToken;




  logout() {
    this._authToken = undefined;
    this._refreshToken = undefined;
    this._user = undefined;
  }

  setLogin(authtoken: string, refreshtoken: string, user: string){
    this._authToken = authtoken;
    this._refreshToken = refreshtoken;
    this._user = user;
  }

  getUser() {
    return this._user
  }

}
