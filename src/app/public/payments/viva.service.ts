import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { VivaToken } from './payment.types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VivaService {

  constructor(private http: HttpClient) { }

  createToken(storeId: number, orderUuid: string): Observable<VivaToken> {
    return this.http.post<VivaToken>(`api/v1/stores/${storeId}/orders/${orderUuid}/viva/checkout`, {});
  }

  doPayment(storeId: number, orderUuid: string, chargeToken: string, accessToken: string) {
    return this.http.post<string>(`api/v1/stores/${storeId}/orders/${orderUuid}/viva/verify`,
      {chargeToken, accessToken}
    );
  }

}
