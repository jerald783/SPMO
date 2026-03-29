import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppInitService } from '../app-init.service';

@Injectable({ providedIn: 'root' })
export class EmailService {
  // private apiUrl = 'http://localhost:5000/api/mail/send'; 
  private get apiUrlSendEmail(): string {
    return `${this.appInit.apiURL}/api/mail/send`; // ✅ Now this is a valid string
  }
    private get apiUrlSendVerification(): string {
    return `${this.appInit.apiURL}/api/EmailVerification`; // ✅ Now this is a valid string
  }
      private get apiUrlForgotPassword(): string {
    return `${this.appInit.apiURL}/api/EmailVerification`; // ✅ Now this is a valid string
  }
  constructor(private http: HttpClient,private appInit: AppInitService) {}

  sendEmail(payload: { to: string; subject: string; body: string }): Observable<Object> {
    return this.http.post(this.apiUrlSendEmail, payload);
  }

  sendVerification(data:any){
  return this.http.post(`${this.apiUrlSendVerification}/send-verification`, data);
}

verifyAndRegister(data:any){
  return this.http.post(`${this.apiUrlSendVerification}/verify-register`, data);
}

forgotPassword(email:any){
  return this.http.post(`${this.apiUrlForgotPassword}/forgot-password`, {email});
}

resetPassword(data:any){
  return this.http.post(`${this.apiUrlForgotPassword}/reset-password`, data);
}
}

