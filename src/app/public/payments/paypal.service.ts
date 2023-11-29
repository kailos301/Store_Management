import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpBackend } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaypalAccessToken, PaypalOrderData } from './payment.types';
import { paypalSandboxSettings, paypalLiveSettings } from './paypal.config';

@Injectable({
  providedIn: 'root'
})
export class PaypalService {

  private http;
  private env;
  private paypalSettings;
  constructor( private handler: HttpBackend) {
    this.http = new HttpClient(handler);
    this.env  = 'SANDBOX';
    this.paypalSettings = paypalSandboxSettings;
    if (this.env === 'PRODUCTION') {
      this.paypalSettings = paypalLiveSettings;
    }
  }

  obtainAccessToken(): Observable<PaypalAccessToken> {
    const httpHeaders = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type' : 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(`${this.paypalSettings.clientId}:${this.paypalSettings.clientSecret}`)
    });
    return this.http.post(`${this.paypalSettings.paypalEndpoint}/v1/oauth2/token`,
                                'grant_type=client_credentials',
                                { headers: httpHeaders});
  }


  createPaypalOrder(params: {}, accessToken: string): Observable<PaypalOrderData>  {
    const httpHeaders = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type' : 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'PayPal-Client-Metadata-Id': '1495725899514oren', // unique-random-user-generated-number
      'PayPal-Request-Id': '9c5e3668-cb92-4a40-99b7-c74cb68913f4', // unique-random-user-generated-number
      // 'PayPal-Partner-Attribution-Id': 'Example_Marketplace',
    });
    return this.http.post(`${this.paypalSettings.paypalEndpoint}/v2/checkout/orders`,
                                JSON.stringify(params),
                                { headers: httpHeaders});
  }

}
