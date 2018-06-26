import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {FlashMessagesService} from 'angular2-flash-messages';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  email: String;

  constructor( private authService:AuthService, private router: Router, private flashMessage:FlashMessagesService) { }

  ngOnInit() {
  }

  generatePassword(){
  let mail = { email: this.email }

    this.authService.sendNewPassword(mail).subscribe(data =>{

     if(data.success)
     {
        this.flashMessage.show(data.msg,{
         cssClass: 'alert-success',
         timeout: 5000});
         this.router.navigate(['/changePassword']);
      }
     else{
        this.flashMessage.show(data.msg,{
         cssClass: 'alert-danger',
         timeout: 5000});
     }

  });
}

}
