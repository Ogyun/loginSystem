import { Component, OnInit } from '@angular/core';
import {ValidateService} from '../../services/validate.service';
import{FlashMessagesService} from 'angular2-flash-messages/module';
import {AuthService} from '../../services/auth.service';
import{Router} from '@angular/router';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  username: String;
  email: String;
  password: String;

  constructor(
    private validateService: ValidateService,
    private flashMessage:FlashMessagesService,
    private authService:AuthService,
    private router: Router) { }

    ngOnInit() {
    }

    onRegisterSubmit(){

      const user = {
        email: this.email,
        username: this.username,
        password: this.password
      }

      //Required Fields
      if(!this.validateService.validateRegister(user)) {
        this.flashMessage.show('Please fill in all fields', {cssClass:'alert-danger', timeout:3000});
        return false;
      }

      //Validate email
      if(!this.validateService.validateEmail(user.email)) {
        this.flashMessage.show('Please use a valid email', {cssClass:'alert-danger', timeout:3000});
        return false;
      }

      if(!this.validateService.validatePassword(user.password)) {
        this.flashMessage.show('Password not strong enough! A password must contain number, lower and uppercase letter and be atleast 8 characters long', {cssClass:'alert-danger', timeout:3000});
        return false;
      }

      //Register user
      this.authService.registerUser(user).subscribe(data =>{
      if(data.success) {
        this.flashMessage.show('You are now registered and can log in', {cssClass:'alert-success', timeout:3000});
        this.router.navigate(['/login']);
      } else if (data.msg === "username already in use") {
        this.flashMessage.show('Username already in use', {cssClass:'alert-danger', timeout:3000});
        this.router.navigate(['/register']);
      }

      else if (data.msg === "email already in use") {
        this.flashMessage.show('Email already in use', {cssClass:'alert-danger', timeout:3000});
        this.router.navigate(['/register']);
      }

      else {
        this.flashMessage.show('Something went wrong', {cssClass:'alert-danger', timeout:3000});
        this.router.navigate(['/register']);
      }
    })

  }
}
