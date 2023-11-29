import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StripeOrderData } from './payment.types';

@Injectable({
  providedIn: 'root'
})
export class SquareService {

  constructor(private http: HttpClient) { }

  doPayment(storeId: number, orderUuid: string, nonce: string, verificationToken: string) {
    return this.http.post<string>(`api/v1/stores/${storeId}/orders/${orderUuid}/square/checkout`,
      {nonce, verificationToken}
    );
  }

}
