import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {FlashMessagesService} from 'angular2-flash-messages';


@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

resetCode:String;
newPassword:String;
confirmNewPassword:String;

  constructor( private authService:AuthService, private router: Router, private flashMessage:FlashMessagesService) { }

  ngOnInit() {
  }

  resetPassword(){
    const newPassword = { code: this.resetCode, newPassword:this.newPassword, confirmPassword:this.confirmNewPassword }

      this.authService.changePassword(newPassword).subscribe(data =>{

       if(data.success)
       {
          this.flashMessage.show(data.msg,{
           cssClass: 'alert-success',
           timeout: 5000});
           this.router.navigate(['/login']);
        }
       else{
          this.flashMessage.show(data.msg,{
           cssClass: 'alert-danger',
           timeout: 5000});
       }

    });
  }
}
