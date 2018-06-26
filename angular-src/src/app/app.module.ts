import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FileSelectDirective } from 'ng2-file-upload';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { NavbarComponent } from './components/navbar/navbar.component';

import { ValidateService } from './services/validate.service';
import { AuthService } from './services/auth.service';
import { FlashMessagesModule } from 'angular2-flash-messages';
import { AuthGuard } from './guards/auth.guard';
import { PostService } from './services/post.service';

import {ValidateService} from './services/validate.service';
import {AuthService} from './services/auth.service';
import{FlashMessagesModule} from 'angular2-flash-messages';
import{AuthGuard} from  './guards/auth.guard';
import{AdminGuard} from  './guards/admin.guard';
import {PostService} from './services/post.service';
import { AdminComponent } from './components/admin/admin.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';

const appRoutes: Routes = [
  {path: '', component: HomeComponent, pathMatch: 'full'},
  {path: 'register', component: RegisterComponent, pathMatch: 'full'},
  {path: 'login', component: LoginComponent, pathMatch: 'full'},
  {path: 'dashboard', component: DashboardComponent, pathMatch: 'full', canActivate:[AuthGuard]},
  {path: 'profile', component: ProfileComponent, pathMatch: 'full', canActivate:[AuthGuard]},
  {path: 'loginAdmin', component: AdminComponent, pathMatch: 'full'},
  {path: 'adminDashboard', component: AdminDashboardComponent, pathMatch: 'full', canActivate:[AdminGuard]},
  {path: 'forgotPassword', component: ForgotPasswordComponent, pathMatch: 'full'},
  {path: 'changePassword', component: ChangePasswordComponent, pathMatch: 'full'},
]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    DashboardComponent,
    ProfileComponent,
    FileSelectDirective
    NavbarComponent,
    AdminComponent,
    AdminDashboardComponent,
    ForgotPasswordComponent,
    ChangePasswordComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    HttpModule,
    FormsModule,
    FlashMessagesModule.forRoot()
  ],
  providers: [ValidateService,AuthService,AuthGuard,AdminGuard,PostService],
  bootstrap: [AppComponent]
})
export class AppModule { }
