import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StripeOrderData } from './payment.types';

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  constructor(private httpClient: HttpClient) { }

  initiateStripePaymentIntent(storeId: number, orderUuid: number, paymentMethod: string): Observable<StripeOrderData> {
    return this.httpClient.post<StripeOrderData>(`api/v2/stores/${storeId}/orders/${orderUuid}/initiatePayment`, {
      paymentMethod,
    });
  }
}
