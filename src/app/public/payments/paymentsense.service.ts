import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PaymentsenseToken } from './payment.types';
import { Observable } from 'rxjs';
import { OrderUpdateRequest } from '../store/types/OrderUpdateRequest';
import { PaymentMethod } from '../store/types/PaymentMethod';

@Injectable({
  providedIn: 'root'
})
export class PaymentsenseService {

  constructor(private http: HttpClient) { }

  createToken(storeId: number, orderUuid: string): Observable<PaymentsenseToken> {
    return this.http.post<PaymentsenseToken>(`api/v2/stores/${storeId}/orders/${orderUuid}/initiatePayment`, {
      paymentMethod: PaymentMethod.CREDIT_CARD_PAYMENTSENSE,
    });
  }

  completePayment(storeId: number, orderUuid: string, data: OrderUpdateRequest) {
    return this.http.put<string>(`api/v2/stores/${storeId}/orders/${orderUuid}`, data);
  }

}
