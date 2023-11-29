import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaypalAccessToken, PaypalPartnerLinks } from './payment.types';

@Injectable({
  providedIn: 'root'
})
export class StorePaymentMethodsService {

  constructor( private http: HttpClient ) {}

  connectStripe(storeId: number): Observable<string> {
    return this.http.get(`/api/v1/stores/${storeId}/stripe/connect`, { responseType: 'text' });
  }

  disconnectStripe(storeId: number): Observable<{}> {
    return this.http.put(`/api/v1/stores/${storeId}/stripe/disconnect`, {});
  }

  connectPaypal(storeId: number): Observable<string> {
    return this.http.get(`/api/v1/stores/${storeId}/paypal/connect`, { responseType: 'text' });
  }

  disconnecPaypal(storeId: number): Observable<{}> {
    return this.http.put(`/api/v1/stores/${storeId}/paypal/disconnect`, {});
  }


}
