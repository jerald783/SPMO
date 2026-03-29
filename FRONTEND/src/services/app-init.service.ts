// src/app/app-init.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {
  private config: any;

  constructor(private http: HttpClient) {}

  loadConfig(): Promise<void> {
    return this.http.get('../assets/config.json')
      .toPromise()
      .then(config => {
        this.config = config;
      })
      .catch(error => {
        console.error('Could not load config.json', error);
        return Promise.reject(error);
      });
  }
  get apiURL(): string {
    return this.config?.apiURL || '';
  }
}

