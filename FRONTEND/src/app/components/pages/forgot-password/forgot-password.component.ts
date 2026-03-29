import { Component } from '@angular/core';
import { EmailService } from '../../../../services/notification-services/email.service';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {

  email:string = '';
  message:string = '';

  constructor(private emailService:EmailService){}

  submit(){

    if(!this.email){
      this.message = "Email required";
      return;
    }

    this.emailService.forgotPassword(this.email).subscribe({
      next:(res:any)=>{
        this.message = "Reset link sent to your email.";
      },
      error:()=>{
        this.message = "Error sending reset email.";
      }
    });

  }

}