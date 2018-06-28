import { Component, OnInit, OnDestroy } from '@angular/core';
import { PostService } from '../../services/post.service';
import { SocketService } from '../../services/socket.service';
import * as socketIo from 'socket.io-client';
import { AuthService } from '../../services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages/module';


@Component({
  moduleId: module.id,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [SocketService]
})
export class DashboardComponent implements OnInit, OnDestroy {

  messages = [];
  connection;
  username: String;
  msg: String;

  constructor(
    private postService: PostService,
    private socketService: SocketService,
    private authService: AuthService,
    private flashMessage: FlashMessagesService) { }

  onRegisterSubmit(e) {

    let newPost = {
      post: this.msg,
      date: new Date()
    }

    if (this.msg.length == 0) {
      e.preventDefault();
      this.flashMessage.show('Please insert a message!', {cssClass:'alert-danger', timeout:3000});
      return false;
    } else {
      this.socketService.sendMessage(newPost);
    }
  }

  ngOnInit() {
    //enable logout tab in the navbar
    this.authService.testLogin = true;
    this.postService.getAllPosts().subscribe(posts => {
      posts.posts.forEach(e => this.messages.unshift(e));
    },
      err => {
        console.log(err);
        return false;
      });

    this.connection = this.socketService.getMessages().subscribe(message => {
      this.messages.unshift(message);
    })
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }
}
