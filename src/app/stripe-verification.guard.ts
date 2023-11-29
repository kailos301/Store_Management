import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';

declare var Stripe;

@Injectable({
  providedIn: 'root'
})
export class StripeVerificationGuard implements CanActivate {

  subdomain: string;
  constructor(private router: Router, private http: HttpClient) { }

  canActivate(route: ActivatedRouteSnapshot) {

    const paymentIntentId = route.queryParams.payment_intent;
    const storeId = route.queryParams.storeId;
    const orderUuid = route.queryParams.orderUuid;
    const status = route.queryParams.redirect_status;

    if (status === 'failed') {
      this.router.navigateByUrl('/#cart');
      return false;
    }
    return this.http.patch<any>(`api/v2/stores/${storeId}/orders/${orderUuid}`, {
      status: 'SUBMITTED',
      paymentInfo: {
        paymentIntentId,
      }
    }).pipe(
      map((result) => {
        if (result.paymentStatus === 'FAILED') {
          this.router.navigateByUrl('/#cart');
          return false;
        } else {
          this.router.navigateByUrl(`/#thankyou/${orderUuid}`);
          return true;
        }
      }),
      catchError(() => {
        this.router.navigateByUrl('/#cart');
        return of(false);
      })
    );

  }
}
