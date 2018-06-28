import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {FlashMessagesService} from 'angular2-flash-messages';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  users = [];

  constructor(
    private authService:AuthService,
    private router: Router,
    private flashMessage: FlashMessagesService
  ) { }

  ngOnInit() {
    //enable logout tab in the navbar
    this.authService.testLogin = false;
    this.authService.getAllUsers().subscribe(data =>{
      if(data.success)
      {
        this.users = data.users;
      }
      else
      {
        this.flashMessage.show("Something went wrong",{
        cssClass: 'alert-danger',
        timeout: 5000});

      }
  });
}

deleteUser(username){

  let user = {username:username};
  this.authService.deleteUser(JSON.stringify(user)).subscribe(data =>{
        if(data.success)
        {
          this.flashMessage.show("User is successfully deleted",{
          cssClass: 'alert-success',
          timeout: 5000});
        }
        else
        {
          this.flashMessage.show("Something went wrong",{
          cssClass: 'alert-danger',
          timeout: 5000});

        }
    });
}

}
