import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {FlashMessagesService} from 'angular2-flash-messages';
import {ValidateService} from '../../services/validate.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  username: String;
  password: String;

  constructor(
    private authService:AuthService,
    private router: Router,
    private flashMessage: FlashMessagesService,
    private validateService: ValidateService) { }

  ngOnInit() {
  }

  onLoginSubmit() {
     const admin = {
       username: this.username,
       password: this.password
     }

     //Required Fields
     if(!this.validateService.validateLogin(admin)) {
       this.flashMessage.show('Please fill in all fields', {cssClass:'alert-danger', timeout:3000});
       return false;
     }

     // Authenticate
     this.authService.authenticateUser(admin).subscribe(data => {
      if(data.success) {
        this.flashMessage.show('You are now logged in',{
          cssClass: 'alert-success',
          timeout: 5000});
          this.authService.testLogin = true;
          this.router.navigate(['/adminDashboard']);
        } else {
           this.flashMessage.show(data.msg,{
           cssClass: 'alert-danger',
           timeout: 5000});
           this.router.navigate(['/loginAdmin']);
          }
        });
      }

}
