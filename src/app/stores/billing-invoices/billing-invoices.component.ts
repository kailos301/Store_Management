import { Component, OnInit } from '@angular/core';
import { LoggedInUser } from 'src/app/auth/auth';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';
import { Observable } from 'rxjs';
import { getSelectedStore } from 'src/app/stores/+state/stores.selectors';
import { Router } from '@angular/router';
import { filter, map, take } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { getPurchaseInvoicesList } from '../store-subscriptions/+state/store-subscriptions.selectors';
import { DownloadPurchaseInvoicePdf } from '../store-subscriptions/+state/store-subscriptions.actions';
import { ClientStore } from '../stores';

@Component({
  selector: 'app-billing-invoices',
  templateUrl: './billing-invoices.component.html',
  styleUrls: ['./billing-invoices.component.scss']
})
export class BillingInvoicesComponent implements OnInit {
  loggedInUser$: Observable<LoggedInUser>;
  storeId$: Observable<number>;
  invoiceList$: Observable<any>;
  selectedStore$: Observable<ClientStore>;
  constructor(private router: Router, private store: Store<any>) { }

  ngOnInit() {
    this.loggedInUser$ = this.store.pipe(select(getLoggedInUser));
    this.invoiceList$ = this.store.pipe(select(getPurchaseInvoicesList));
    this.selectedStore$ = this.store.pipe(select(getSelectedStore), filter(store => store.id !== -1));
    this.storeId$ = this.selectedStore$.pipe(
      map(s => s.id)
    );
  }
  gotoInvoice(invoiceId) {
    this.storeId$.pipe(
      take(1),
    ).subscribe(id => this.router.navigate(['/manager/stores', id, 'billing', 'subscriptions', 'invoice', invoiceId]));
  }
  downloadPdf(purchaseID: number) {
    this.storeId$.pipe(
      take(1),
    ).subscribe(id => this.store.dispatch(new DownloadPurchaseInvoicePdf(id, purchaseID)));
  }

}
