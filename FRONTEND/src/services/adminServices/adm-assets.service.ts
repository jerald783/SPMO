import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppInitService } from '../app-init.service';

@Injectable({
  providedIn: 'root',
})
export class AdmAssetsService {
  constructor(private http: HttpClient, private appInit: AppInitService) {}
  get apiUrlAsset(): string {
    return `${this.appInit.apiURL}/api`;
  }
  get apiUrlsGetAsset(): string {
    return `${this.appInit.apiURL}/api/assets`;
  }

  get apiUrlsGetTicket(): string {
    return `${this.appInit.apiURL}/api/Ticket`;
  }
  get apiUrlsGetProp(): string {
    return `${this.appInit.apiURL}/api/Ticket`;
  }
  //Repository
  getAssets(): Observable<any[]> {
    return this.http.get<any>(this.apiUrlAsset + '/Assets');
  }

  addAssets(asset: any) {
    return this.http.post(`${this.apiUrlAsset}/Assets`, asset);
  }
  updateAssets(assetId: any) {
    return this.http.put(`${this.apiUrlAsset}/Assets`, assetId);
  }
  deleteAssets(assetId: number) {
    return this.http.delete(`${this.apiUrlAsset}/Assets/${assetId}`);
  }
  getUserId() {
  return this.http.get<{ id: number, Emails: string }[]>(`${this.apiUrlsGetAsset}/usersemail`);
}
  // uploadFile(val: any) {
  //   return this.http.post(this.APIUrl + '/Assets/SaveFile', val);
  // }

  // getAssetsByUser(Email: string): Observable<any> {
  //   return this.http.get(`${this.apiUrlsGetAsset}/GetAssetsByUser/${Email}`); // Pass Username to API
  // }

  //   transferAsset(assetId: number, newEmail: string) {
  //   return this.http.put(`${this.apiUrlsGetAsset}/Transfer/${assetId}`, {
  //     newEmail,
  //   });
  // }
  bulkTransferAssets(ids: number[], newEmail: string) {
    return this.http.put(`${this.apiUrlAsset}/Assets/BulkTransfer`, {
      ids,
      newEmail,
    });
  }

  getAssetsByUser(identifier: string): Observable<any> {
    return this.http.get(
      `${this.apiUrlsGetAsset}/GetAssetsByUser/${identifier}`
    );
  }

  // getAllProps(): Observable<any> {
  //   return this.http.get(`${this.apiUrlsGetProp}/GetAllProp`);
  // }

}
