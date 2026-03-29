import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppInitService } from '../app-init.service';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient, private appInit: AppInitService) {}

  get apiUser(): string {
    return `${this.appInit.apiURL}/api/user`;
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUser}/register`, user, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  getRoles(): Observable<any> {
    return this.http.get(`${this.apiUser}/roles`, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUser}/login`, {
      Email: email,
      Password: password,
    });
  }
  // getAuthHeaders(): HttpHeaders {
  //   const token = localStorage.getItem('authToken');
  //   return new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${token}`,
  //   });
  // }
  setAuthData(token: string, role: string): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userRole', role);
  }

  // isAuthenticated(): boolean {
  //   return !!localStorage.getItem('authToken');
  // }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }
  getAllUser():Observable<any[]> {
    return this.http.get<any>(`${this.apiUser}/all`)
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
  }
  getRoleId() {
  return this.http.get<{ id: number, name: string }[]>(`${this.apiUser}/roles`);
}
  getUserEmail(): string | null {
    return localStorage.getItem('Email');
  }
  getAgents(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUser}/agents`);
}
getZoomRecipients(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUser}/zoom-recipients`);
}
}
