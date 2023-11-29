import { ClientStore } from './../stores';
import { getSelectedStore } from 'src/app/stores/+state/stores.selectors';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';
import { ClientStoreSubscription, StoreSubscription, toClientSubscriptionStatus, toSubscriptionStatus } from './subscriptions';
import { getPurchaseInvoicesList } from './+state/store-subscriptions.selectors';
import { PurchaseSubscriptions, DownloadPurchaseInvoicePdf } from './+state/store-subscriptions.actions';
import { helpPage } from 'src/app/shared/help-page.const';
import { TranslateService } from '@ngx-translate/core';
import { LoggedInUser } from 'src/app/auth/auth';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';

@Component({
  selector: 'app-store-subscriptions',
  templateUrl: './store-subscriptions.component.html',
  styleUrls: ['./store-subscriptions.component.scss']
})
export class StoreSubscriptionsComponent implements OnInit {
  selectedStore$: Observable<ClientStore>;
  storeId$: Observable<number>;
  subscription$: Observable<StoreSubscription>;
  clientSubscriptionStatus$: Observable<ClientStoreSubscription>;
  toStatus = toClientSubscriptionStatus;
  invoiceList$: Observable<any>;
  storeSubscriptionHelpPage = helpPage.subscription;
  loggedInUser$: Observable<LoggedInUser>;

  constructor(private store: Store<any>, private router: Router, private translateService: TranslateService) { }

  ngOnInit() {
    this.selectedStore$ = this.store.pipe(select(getSelectedStore), filter(store => store.id !== -1));
    this.loggedInUser$ = this.store.pipe(select(getLoggedInUser));
    this.subscription$ = this.selectedStore$.pipe(filter(s => !!s.subscription),
      map(s => s.subscription)
    );
    this.clientSubscriptionStatus$ = this.selectedStore$.pipe(filter(s => !!s.subscription),
      map(s => ({ status: s.subscription.status, createdAt: s.createdAt }))
    );
    this.storeId$ = this.selectedStore$.pipe(
      map(s => s.id)
    );
    this.invoiceList$ = this.store.pipe(select(getPurchaseInvoicesList));
  }

  goToPayment() {
    this.storeId$.pipe(
      take(1),
    ).subscribe(id => this.router.navigate(['/manager/stores', id, 'billing', 'subscriptions', 'purchase']));
  }
  goToExtendSubsPurchase() {
    this.storeId$.pipe(
      take(1),
    ).subscribe(id => this.router.navigate(['/manager/stores', id, 'billing', 'subscriptions', 'extend-subscription']));
  }
  downloadPdf(purchaseID: number) {
    this.storeId$.pipe(
      take(1),
    ).subscribe(id => this.store.dispatch(new DownloadPurchaseInvoicePdf(id, purchaseID)));
  }
  gotoInvoice(invoiceId) {
    this.storeId$.pipe(
      take(1),
    ).subscribe(id => this.router.navigate(['/manager/stores', id, 'billing', 'subscriptions', 'invoice', invoiceId]));
  }
  get currentLanguage(): string {
    return this.translateService.currentLang;
  }


}
