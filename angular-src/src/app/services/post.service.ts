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
    return this.http.get('https://167.99.246.26:3000/posts/getAllPosts',{headers: headers})
      .map(res => res.json());
  }

  loadToken(){
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }

}
