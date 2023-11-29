import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ClientStore, StoreCatalog, Order, OrderItem, Offer, SaveOfferView, OrderMeta, LocationValid, EmailMessage, AssociatedZone } from './../../stores/stores';
import { Injectable } from '@angular/core';
import { OfferItem, CatalogLanguagesList } from './+state/stores.reducer';
import { UpdateOrderItemQuantityRequest } from './types/UpdateOrderItemQuantityRequest';
import { CustomerVoucher } from './types/VoucherValidationResponse';
import { OrderUpdateRequest } from './types/OrderUpdateRequest';
import { AvailableSlotsResponse } from './types/AvailableSlotsResponse';
import { SocialAccountLoginDetails, CustomerDetailsUpdateRequest, CustomerSocialLoginResponse } from './types/CustomerSocialLogin';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class StoreService {

    constructor(private http: HttpClient) {
    }

    load(storeAlias: string): Observable<ClientStore> {
      return this.http.get<ClientStore>(`/api/v1/stores/${storeAlias}`);
    }

    getcatalog(storeId: number, selectedLang: string, referenceTime?: string): Observable<StoreCatalog> {
      const params: any = {};
      if (selectedLang) {
        params.languageId = selectedLang;
      }
      if (referenceTime) {
        params.referenceTime = referenceTime;
      }
      return this.http.get<StoreCatalog>(`/api/v1/stores/${storeId}/catalog`, {params});
    }

    getAvailableLanguages(storeId: number): Observable<CatalogLanguagesList> {
      return this.http.get<CatalogLanguagesList>(`/api/v1/stores/${storeId}/catalog/languages`);
    }

    retrieveOfferItem(storeId: number, catalogId: number, offerId: number, selectedLang: string = 'en'): Observable<Offer> {
      return this.http.get<Offer>(`api/v1/stores/${storeId}/catalog/${catalogId}/offer/${offerId}?languageId=${selectedLang}`);
    }

    initializeEmptyOrder(storeId: number, payload: Order): Observable<Order> {
      if (this.isOrderCapture()) {
        return this.http.post<Order>(`api/v2/user/stores/${storeId}/orders`, payload);
      }
      return this.http.post<Order>(`api/v1/stores/${storeId}/orders`, payload);
    }

    checkExistingOrder(storeId: number, orderUuid: string, locale: string = 'en'): Observable<Order> {
      return this.http.get<Order>(`api/v1/stores/${storeId}/orders/${orderUuid}?locale=${locale}`);
    }

    addOrderItem(storeId: number, orderUuid: string, orderItem: OrderItem): Observable<Order> {
      return this.http.put<Order>(`api/v1/stores/${storeId}/orders/${orderUuid}/orderItems`, orderItem);
    }

    // for future use, expected to be able to bulk add offers to cart
    addOrderItems(storeId: number, orderUuid: string, orderItems: OrderItem[]): Observable<Order> {
      return this.http.put<Order>(`api/v1/stores/${storeId}/orders/${orderUuid}/orderItems`, orderItems);
    }

    updateOrderItem(storeId: number, orderUuid: string, itemUuid: string, orderItem: OrderItem): Observable<OrderItem> {
      return this.http.put<OrderItem>(`api/v1/stores/${storeId}/orders/${orderUuid}/orderItems/${itemUuid}`, orderItem);
    }

    removeOrderItem(storeId: number, orderUuid: string, itemUuid: string): Observable<Order> {
      console.log('removing', storeId, orderUuid, itemUuid);
      return this.http.delete<Order>(`api/v1/stores/${storeId}/orders/${orderUuid}/orderItems/${itemUuid}`);
    }

    isAdminOrderUpdate(): boolean {
      return window.location.href.includes('/orders/');
    }

    isOrderCapture(): boolean {
      return window.location.href.includes('/capture/');
    }

    orderUpdate(storeId: number, orderUuid: string, payload: OrderUpdateRequest, v2Support: boolean): Observable<Order> {
      if (this.isAdminOrderUpdate()) {
        if (payload.validateOrder) {
          delete payload.validateOrder;
          delete payload.status;
        }
        payload.validateOrder = undefined;
        payload.status = undefined;
        return this.http.patch<Order>(`api/v2/user/stores/${storeId}/orders/${orderUuid}`, payload);
      }
      if (v2Support) {
        return this.http.put<Order>(`api/v2/stores/${storeId}/orders/${orderUuid}`, payload);
      } else {
        return this.http.put<Order>(`api/v1/stores/${storeId}/orders/${orderUuid}`, payload);
      }
    }

    orderUpdateStatus(storeId: number, orderUuid: string, orderStatus: string): Observable<Order> {
      const httpHeaders = new HttpHeaders({
        'Content-Type' : 'application/json',
        'Cache-Control': 'no-cache'
      });
      return this.http.put<Order>(`api/v1/stores/${storeId}/orders/${orderUuid}/status`, JSON.stringify(orderStatus), {
        headers: httpHeaders
      });
    }

    orderUpdateQuantities(storeId: number, orderUuid: string, payload: UpdateOrderItemQuantityRequest[]): Observable<void> {
      return this.http.put<void>(`api/v1/stores/${storeId}/orders/${orderUuid}/orderItems/actions/updateQuantities`, payload);
    }

    validateStoreLocation(storeId: number, storeLocation: string): Observable<LocationValid> {
      return this.http.post<LocationValid>(`api/v1/stores/${storeId}/locations/validate`, {label: storeLocation});
    }

    sendOrderByEmail(orderUuid: string, email: string): Observable<EmailMessage> {
      return this.http.post<EmailMessage>(`api/v1/stores/order/${orderUuid}/email`, {email});
    }

    getZonePerZipcode(storeId: number, zipCode: string): Observable<any> {
      return this.http.get<any>(`api/v1/stores/${storeId}/zones?postcode=${zipCode}`);
    }

    getStoreRules(storeId: number, langId: string): Observable<any> {
      return this.http.get<any>(`api/v1/stores/${storeId}/rules${(langId !== '') ? `?postcode=${langId}` : '' }`);
    }

    validateVoucher(storeId: number, voucherCode: string): Observable<CustomerVoucher> {
      return this.http.post<CustomerVoucher>(`api/v1/stores/${storeId}/customer-voucher/validate`, {code: voucherCode});
    }

    getSlots(storeId: number, deliveryMode: string, date?: string): Observable<AvailableSlotsResponse> {
      return this.http.post<AvailableSlotsResponse>(`api/v1/stores/${storeId}/slots`, {date, mode: deliveryMode});
    }

    socialLogin(loginRequest: SocialAccountLoginDetails): Observable<CustomerSocialLoginResponse> {
      return this.http.post<CustomerSocialLoginResponse>(`/api/v1/auth/login/customer`, loginRequest);
    }

    customerDetailsUpdate(customerDetailsUpdateRequest: CustomerDetailsUpdateRequest): Observable<CustomerSocialLoginResponse> {
      return this.http.post<CustomerSocialLoginResponse>(`/api/v1/auth/update/customer`, customerDetailsUpdateRequest);
    }

    getLocationFromAddress(address: string, zipCode: string, countryCode: string): Observable<any> {
      return this.http.get<any>('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address,
          key: environment.googleMapAPIKey,
          components: 'country:' + countryCode + (zipCode ? '|postal_code:' + zipCode : ''),
        }
      });
    }

    getAssociatedZone(storeId: number, orderUuid: string): Observable<AssociatedZone> {
      return this.http.get<AssociatedZone>(`api/v2/stores/${storeId}/orders/${orderUuid}/associatedZone`);
    }
}
