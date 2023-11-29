import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ClientStoreLocation, ClientStoreLocationRequest } from './store-location';
import { Injectable } from '@angular/core';
import { PageableResults, Paging, defaultPaging } from '../../api/types/Pageable';
import { QRCodeResponse } from '../stores';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class StoreLocationService {

    constructor(private http: HttpClient) { }

    get(storeId: number, locationId: number): Observable<ClientStoreLocation> {
      return this.http.get<ClientStoreLocation>(`/api/v1/stores/${storeId}/locations/${locationId}`);
    }

    list(id: number, paging = defaultPaging): Observable<PageableResults<ClientStoreLocation>> {
      return this.http.get<PageableResults<ClientStoreLocation>>
                  (`/api/v1/stores/${id}/locations?page=${paging.page}&size=${paging.size}&sort=id,asc`);
    }

    create(storeId: number, payload: ClientStoreLocationRequest[]): Observable<ClientStoreLocation[]> {
      return this.http.post<ClientStoreLocation[]>(`/api/v1/stores/${storeId}/locations`, payload);
    }

    update(storeId: number, locationId: number, payload: ClientStoreLocationRequest): Observable<ClientStoreLocation> {
      return this.http.put<ClientStoreLocation>(`/api/v1/stores/${storeId}/locations/${locationId}`, payload);
    }

    patch(storeId: number, locationId: number, action: string): Observable<ClientStoreLocation> {
      return this.http.patch<ClientStoreLocation>(`/api/v1/stores/${storeId}/locations/${locationId}/${action}`, {});
    }

    delete(storeId: number, locationId: number): Observable<void> {
      return this.http.delete<void>(`/api/v1/stores/${storeId}/locations/${locationId}`);
    }

    downloadQRImage(storeId: number, locationId: number): Observable<QRCodeResponse> {
      return this.http.get(`/api/v1/stores/${storeId}/location/${locationId}/qr-image`, {
        observe: 'response',
        responseType: 'blob'
      }).pipe(
        map(r => this.toQRCodeResponse(r))
      );
    }

    downloadQRImageFull(storeId: number, locationId: number): Observable<QRCodeResponse> {
      return this.http.get(`/api/v1/stores/${storeId}/location/${locationId}/qr-image?full-version=true`, {
        observe: 'response',
        responseType: 'blob'
      }).pipe(
        map(r => this.toQRCodeResponse(r))
      );
    }

    downloadQRPdf(storeId: number, locationId: number): Observable<QRCodeResponse> {
      return this.http.get(`/api/v1/stores/${storeId}/location/${locationId}/qr-pdf`, {
        observe: 'response',
        responseType: 'blob'
      }).pipe(
        map(r => this.toQRCodeResponse(r))
      );
    }

    private toQRCodeResponse(response: HttpResponse<Blob>): QRCodeResponse {
      const blob = response.body;
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition.slice(contentDisposition.indexOf('filename=') + 9).replace(/"/g, '');
      return { blob, filename };
    }

    validPin(storeId: number, locationId: number, pinCode: number): Observable<ClientStoreLocation> {
      return this.http.get<ClientStoreLocation>(`/api/v1/stores/${storeId}/locations/${locationId}/validate-pin?pin=${pinCode}`);
    }
}
