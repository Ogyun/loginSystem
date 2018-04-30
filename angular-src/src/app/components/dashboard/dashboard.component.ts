import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit() {
this.postService.getAllPosts().subscribe(posts => {
    posts.posts.forEach(e => this.messages.unshift(e));
  },
  err => {
    console.log(err);
    return false;
});

}
