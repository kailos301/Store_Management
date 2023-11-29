import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RMSRequestJSON } from './payment.types';
import { Observable } from 'rxjs';
import { OrderUpdateRequest } from '../store/types/OrderUpdateRequest';
import { PaymentMethod } from '../store/types/PaymentMethod';

@Injectable({
  providedIn: 'root'
})
export class RMSService {

  constructor(private http: HttpClient) { }

  initPayment(storeId: number, orderUuid: string): Observable<RMSRequestJSON> {
    return this.http.post<RMSRequestJSON>(`api/v2/stores/${storeId}/orders/${orderUuid}/initiatePayment`, {
      paymentMethod: PaymentMethod.CREDIT_CARD_RMS,
    });
  }

  completePayment(storeId: number, orderUuid: string, data: OrderUpdateRequest) {
    return this.http.put<string>(`api/v2/stores/${storeId}/orders/${orderUuid}`, data);
  }

}
