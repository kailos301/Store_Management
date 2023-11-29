import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TrustPaymentsPaymentInfo, TrustPaymentsRequestJSON } from './payment.types';
import { Observable } from 'rxjs';
import { OrderUpdateRequest } from '../store/types/OrderUpdateRequest';
import { PaymentMethod } from '../store/types/PaymentMethod';

@Injectable({
  providedIn: 'root'
})
export class TrustPaymentsService {

  constructor(private http: HttpClient) { }

  initPayment(storeId: number, orderUuid: string): Observable<TrustPaymentsRequestJSON> {
    return this.http.post<TrustPaymentsRequestJSON>(`api/v2/stores/${storeId}/orders/${orderUuid}/initiatePayment`, {
      paymentMethod: PaymentMethod.CREDIT_CARD_TRUSTPAYMENTS,
    });
  }

  verifyPayment(storeId: number, orderUuid: string, paymentProviderResponse: TrustPaymentsPaymentInfo) {
    return this.http.post<string>(`api/v2/stores/${storeId}/orders/${orderUuid}/verifyPayment`, JSON.stringify(paymentProviderResponse));
  }

  completePayment(storeId: number, orderUuid: string, data: OrderUpdateRequest) {
    return this.http.put<string>(`api/v2/stores/${storeId}/orders/${orderUuid}`, data);
  }

}
