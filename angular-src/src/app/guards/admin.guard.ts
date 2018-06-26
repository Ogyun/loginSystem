import {Injectable} from '@angular/core';
import {Router, CanActivate} from '@angular/router';
import {AuthService} from '../services/auth.service';

@Injectable()
export class AdminGuard implements CanActivate{
  constructor(private authService:AuthService, private router:Router){

  }

  canActivate() {
    return this.authService.checkIfAdmin().map(res => {
      if(!res) {
        this.router.navigate(['/login']);
      }
      return res;
    });
  }

}
