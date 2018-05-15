import { Injectable } from '@angular/core';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class AuthService {
  authToken: any;
  user: any;

  constructor(private http:Http) { }

  registerUser(user){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('http://167.99.246.26:443/users/register', user,{headers: headers})
    .map(res => res.json());
  }

  authenticateUser(user){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('http://167.99.246.26:443/users/authenticate', user,{headers: headers})
    .map(res => res.json());
  }

  storeUserData(token, user){
    localStorage.setItem('id_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }

  loadToken(){
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }

  loggedIn(){
    this.loadToken();
    if(this.authToken != null) {
      return JSON.parse(atob(this.authToken.split(".")[1])).iat > Date.now();
    } else {
      return false;
    }
  }

  logout(){
    this.authToken = null;
    this.user = null;
    localStorage.clear();
  }

}
