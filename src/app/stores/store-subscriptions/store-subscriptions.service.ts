import { StripeCheckoutSession, StorePurchase, StorePurchaceUpdateRequest, PurchaseInvoiceResponse, StorePurchaseStatus } from './subscriptions';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ClientStore } from '../stores';

@Injectable({ providedIn: 'root' })
export class StoreSubscriptionsService {

  constructor(private http: HttpClient) { }

  public list(storeId: number, status?: StorePurchaseStatus | ''): Observable<StorePurchase[]> {
    return this.http.get<StorePurchase[]>(`/api/v1/stores/${storeId}/purchases?status=${status}`);
  }

  initiatePurchase(storeId: number): Observable<StorePurchase> {
    return this.http.post<StorePurchase>(`/api/v1/stores/${storeId}/purchases/initiate`, {});
  }

  updatePurchase(storeId: number, purchaseId: number, updateRequest: StorePurchaceUpdateRequest): Observable<StorePurchase> {
    return this.http.put<StorePurchase>(`/api/v1/stores/${storeId}/purchases/${purchaseId}`, updateRequest);
  }

  checkoutStripe(storeId: number, purchaseId: number): Observable<StripeCheckoutSession> {
    return this.http.post<StripeCheckoutSession>(`/api/v1/subscriptions/checkout/stripe`, { storeId, purchaseId });
  }

  checkoutIdeal(storeId: number, purchaseId: number): Observable<StripeCheckoutSession> {
    return this.http.post<StripeCheckoutSession>(`/api/v1/subscriptions/checkout/ideal`, { storeId, purchaseId });
  }

  checkoutBancontact(storeId: number, purchaseId: number): Observable<StripeCheckoutSession> {
    return this.http.post<StripeCheckoutSession>(`/api/v1/subscriptions/checkout/bancontact`, { storeId, purchaseId });
  }

  checkoutPaypal(storeId: number, purchaseId: number): Observable<string> {
    return this.http.post<string>(`/api/v1/subscriptions/checkout/paypal`, { storeId, purchaseId }, { responseType: 'text' as 'json' });
  }

  downloadPurchaseInvoicePdf(storeId: number, purchaseId: number): Observable<PurchaseInvoiceResponse> {
    return this.http.get(`/api/v1/stores/${storeId}/purchases/${purchaseId}/invoice`, {
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map(r => this.toPurchaseInvoiceResponse(r))
    );
  }

  private toPurchaseInvoiceResponse(response: HttpResponse<Blob>): PurchaseInvoiceResponse {
    const blob = response.body;
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition.slice(contentDisposition.indexOf('filename=') + 9).replace(/"/g, '');
    return { blob, filename };
  }

  extendSubsriptionPurchase(storeId: number, request: any): Observable<ClientStore> {
    return this.http.put<ClientStore>(`/api/v1/stores/${storeId}/subscription/extend`, request);
  }

  getInvoiceById(storeId: number, invoiceId: number): Observable<StorePurchase> {
    return this.http.get<StorePurchase>(`/api/v1/stores/${storeId}/purchases/${invoiceId}`);
  }

  saveInvoice(invoiceId: number, request: any): Observable<StorePurchase> {
    if (+invoiceId === 0) {
      return this.http.post<StorePurchase>(`/api/v1/stores/purchases/custom`, request);
    } else {
      return this.http.put<StorePurchase>(`/api/v1/stores/purchases/custom/${invoiceId}`, request);
    }
}

  deleteInvoice(invoiceId: number): Observable<void> {
    return this.http.delete<void>(` /api/v1/stores/purchases/custom/${invoiceId}`);
  }
}
