import { Injectable } from '@angular/core';
import {Http, Headers} from '@angular/http';

@Injectable()
export class PostService {
    authToken: any;

  constructor(private http:Http) { }

  getAllPosts(){
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.authToken);
    headers.append('Content-Type', 'application/json');
    return this.http.get('http://localhost:3000/posts/getAllPosts',{headers: headers})
      .map(res => res.json());
  }

//   getCookie(cname) {
//    var name = cname + "=";
//    var decodedCookie = decodeURIComponent(document.cookie);
//    var ca = decodedCookie.split(';');
//    for(var i = 0; i <ca.length; i++) {
//        var c = ca[i];
//        while (c.charAt(0) == ' ') {
//            c = c.substring(1);
//        }
//        if (c.indexOf(name) == 0) {
//            return c.substring(name.length, c.length);
//        }
//    }
//    return "";
// }

  loadToken(){
  //  const token = this.getCookie("id_token");
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }

}
