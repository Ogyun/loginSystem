import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { FlashMessagesService } from 'angular2-flash-messages/module';

const URL = 'http://localhost:3000/users/fileupload';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit {

  constructor(private authService: AuthService, private flashMessage: FlashMessagesService) { }

  public uploader: FileUploader = new FileUploader({ url: URL, itemAlias: 'photo', queueLimit: 1 });

  // user informartion
  username: String;
  email: String;
  profileIcon: String;

  ngOnInit() {

    // get user informartion
    this.authService.getProfile().subscribe(user => {
      this.username = user.username
      this.email = user.email
      this.profileIcon = user.profileIcon
    });

    //override the onAfterAddingfile property of the uploader so it doesn't authenticate with //credentials.
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };

    //overide the onCompleteItem property of the uploader so we are
    //able to deal with the server response.
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {

    let res = JSON.parse(response);

      if (res.success) {
        this.flashMessage.show('New profile image uploaded', { cssClass: 'alert-success', timeout: 3000 });

      } else {
        this.flashMessage.show('An error occoured, remember size and image limits.', { cssClass: 'alert-danger', timeout: 3000 });
      }
    };

  }

}
