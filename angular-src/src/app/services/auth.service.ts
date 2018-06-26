import { Injectable } from '@angular/core';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class AuthService {
  authToken: any;
  user: any;
  public testLogin = false;
  public testAdmin = false;

  constructor(private http:Http) { }

  registerUser(user){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('https://167.99.246.26:3000/users/register', user,{headers: headers})
    .map(res => res.json());
  }

  authenticateUser(user){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('https://167.99.246.26:3000/users/authenticate', user,{headers: headers})
    .map(res => res.json());
  }

  deleteUser(username){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('https://167.99.246.26:3000/users/deleteUser', username,{headers: headers})
    .map(res => res.json());
  }
  getAllUsers(){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.get('https://167.99.246.26:3000/users/getAllUsers',{headers: headers})
      .map(res => res.json());
  }
  sendNewPassword(mail){
  let headers = new Headers();
  headers.append('Content-Type', 'application/json');
  return this.http.post('https://167.99.246.26:3000/users/forgotPassword', mail,{headers: headers})
  .map(res => res.json());
  }

  changePassword(newPassword){
  let headers = new Headers();
  headers.append('Content-Type', 'application/json');
  return this.http.post('https://167.99.246.26:3000/users/changePassword', newPassword,{headers: headers})
  .map(res => res.json());
  }

/*
  storeUserData(token, user){
    localStorage.setItem('id_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }

  loadToken() {
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }
  */

  loggedIn() {
    return this.http.get('https://167.99.246.26:3000/users/validateToken')
      .map(res => res.json()).map(data => data.success);
  }

  checkIfAdmin() {
    return this.http.get('https://167.99.246.26:3000/users/validateAdmin')
      .map(res => res.json()).map(data => data.success);
  }

  logout() {
    return this.http.get('https://167.99.246.26:3000/users/logout')
      .map(res => res.json());
  }


  getProfile() {
    return this.http.get('https://167.99.246.26:3000/users/profile')
      .map(res => res.json());
  }

}
