import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppInitService } from '../app-init.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(    private http: HttpClient,
      private appInit: AppInitService,) {}
  private get apiUrlUser(): string {
    return `${this.appInit.apiURL}/api/GoogleLogin`; //  Now this is a valid string
  }
    private get apiUrlSmtp(): string {
    return `${this.appInit.apiURL}/api/Smtp`; //  Now this is a valid string
  }

  getGoogleClientId(){
    return this.http.get<any>(`${this.apiUrlUser}/google-client-id`);
  }

  getSmtpSettings(){
    return this.http.get<any>(`${this.apiUrlSmtp}/smtp-settings`);
  }

  googleLogin(token: string) {
  return this.http.post(`${this.apiUrlUser}/google-login`, {
    token: token
  });

}

  updateSmtp(data:any){
  return this.http.put(`${this.apiUrlSmtp}/update-smtp`, data);
}

updateGoogle(data:any){
  return this.http.put(`${this.apiUrlUser}/update-google-client-id`, data);
}
}