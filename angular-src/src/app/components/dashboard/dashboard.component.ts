import { Component, OnInit } from '@angular/core';
import {PostService} from '../../services/post.service';

@Component({
  moduleId: module.id,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  messages = [];

  constructor(private postService: PostService) { }

  ngOnInit() {
    this.postService.getAllPosts().subscribe(posts => {
      posts.posts.forEach(e => this.messages.unshift(e));
    },
    err => {
      console.log(err);
      return false;
    });

  }
}
