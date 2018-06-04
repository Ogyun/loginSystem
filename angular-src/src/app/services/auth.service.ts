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
    headers.append('Accept', 'application/json');
    return this.http.post('http://localhost:3000/users/register', user,{headers: headers})
    .map(res => res.json());
  }

  authenticateUser(user){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('http://localhost:3000/users/authenticate', user,{headers: headers})
    .map(res => res.json());
  }

  /*
  getCookie(cname) {
     var name = cname + "=";
     var decodedCookie = decodeURIComponent(document.cookie);
     var ca = decodedCookie.split(';');
     for(var i = 0; i <ca.length; i++) {
         var c = ca[i];
         while (c.charAt(0) == ' ') {
             c = c.substring(1);
         }
         if (c.indexOf(name) == 0) {
             return c.substring(name.length, c.length);
         }
     }
     return "";
 }
*/
  storeUserData(token, user){
    // let dateExpire = JSON.parse(atob(token.split(".")[1])).iat;
    // let d = new Date(parseInt(dateExpire));
    // document.cookie = "id_token=" + token + ";expires=" + d + ";" +"path=/"+ ";secure";//+"; HttpOnly ;secure";
    // document.cookie = "user="+ JSON.stringify(user) + ";expires=" + d+ ";secure";// +";HttpOnly";
    localStorage.setItem('id_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }

  loadToken(){
    //const token = this.getCookie("id_token");
      const token = localStorage.getItem('id_token');
  //    if (token == null ){

          this.authToken = token;
  //    }
  //    else
  //    {
    //    return false;
    //  }
  }

  loggedIn(){
    /*
    return this.http.get('http://localhost:3000/users/validateToken')
      .map(res => res.json()).map(data => data.success).toPromise();
      */
  }

  logout(){
    /*
    this.authToken = null;
    this.user = null;
    localStorage.clear();
    // document.cookie = "id_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // document.cookie="user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    */
  }

}
