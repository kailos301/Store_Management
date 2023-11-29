import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import { debounceTime, filter, map, takeUntil, tap } from 'rxjs/operators';
import { ReferenceDataService } from 'src/app/api/reference-data.service';
import { Country } from 'src/app/api/types/Country';
import { helpPage } from 'src/app/shared/help-page.const';
import { DeleteInvoice, SaveInvoice, UpdateSubscriptionPurchase } from '../+state/store-subscriptions.actions';
import { getStatus, getSubscriptionInvoice, getSubscriptionPurchase, getValidations } from '../+state/store-subscriptions.selectors';
import { getSelectedStore } from '../../+state/stores.selectors';
import { ClientStore } from '../../stores';
import { StorePurchase } from '../subscriptions';

@Component({
  selector: 'app-store-invoice',
  templateUrl: './store-invoice.component.html',
  styleUrls: ['./store-invoice.component.scss']
})
export class StoreInvoiceComponent implements OnInit, OnDestroy {
  subscriptionPurchase$: Observable<StorePurchase>;
  invoiceForm: FormGroup;
  destroyed$ = new Subject<void>();
  subscriptionPurchaseHelpPage = helpPage.subscription;
  countryObj: Country;
  currencyList = new Array<string>();
  inValidVat: boolean;
  inValidVoucher: any;
  reservedVoucher: boolean;
  selectedStore$: Observable<ClientStore>;
  storeId: any;
  invoiceId: number;
  currencyIsoCode: string;
  discountPercentage: number;
  paymentProvider: string;
  constructor(private store: Store<any>, private fb: FormBuilder,
              private referenceDataService: ReferenceDataService,
              private actRouter: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    this.storeId = this.actRouter.snapshot.params.id;
    this.invoiceId = this.actRouter.snapshot.params.invoiceId;
    this.invoiceForm = this.fb.group({
      vatNumber: ['', Validators.compose([Validators.minLength(5), Validators.maxLength(20)])],
      voucherCode: ['',
        Validators.compose(
          [Validators.minLength(1), Validators.maxLength(16), Validators.pattern('^[a-zA-Z0-9]{4}(-)?[a-zA-Z0-9]{4}$')]
        )],
      paymentProvider: [''],
      price: ['', Validators.required],
      currencyIsoCode: ['', Validators.required],
      discount: [''],
      discountPercentage: ['0'],
      paymentId: ['', Validators.maxLength(40)],
      partnerEmail: ['', Validators.email]
    });
    this.selectedStore$ = this.store.pipe(select(getSelectedStore));

    this.subscriptionPurchase$ = this.store.pipe(
      select(getSubscriptionPurchase)
    );

    combineLatest([this.selectedStore$, this.referenceDataService.getCountries()])
      .pipe(
        takeUntil(this.destroyed$),
        filter(res => !!res[0] && !!res[1] && !!res[1].data)
      ).subscribe(res => {
        const countriesList = res[1].data;
        countriesList.forEach(s => {
          if (this.currencyList.indexOf(s.subscriptionCurrency) === -1) {
            this.currencyList.push(s.subscriptionCurrency);
          }
        });
        this.countryObj = countriesList.find(x => +x.id === res[0].address.country.id);
        if (this.countryObj && !this.invoiceForm.get('price') && !this.invoiceForm.get('currencyIsoCode') ) {
          this.invoiceForm.get('price').setValue(this.countryObj.subscriptionPrice);
          this.invoiceForm.get('currencyIsoCode').setValue(this.countryObj.subscriptionCurrency);
        }
      });


    if (+this.invoiceId !== 0) {
      this.store.pipe(
        select(getSubscriptionInvoice),
        takeUntil(this.destroyed$),
        tap(invoice => this.currencyIsoCode = invoice.currency),
        tap(invoice => this.discountPercentage = invoice.discountPercentage ? invoice.discountPercentage : 0),
        tap(invoice => this.paymentProvider = invoice.paymentProvider),
       )
      .subscribe(invoice =>
        this.invoiceForm.patchValue({
          price: invoice.price,
          discountPercentage: invoice.discountPercentage,
          discount: invoice.discount,
          currencyIsoCode: invoice.currency,
          voucherCode: invoice.voucherCode,
          vatNumber: invoice.vatNumber,
          paymentId: invoice.paymentId,
          paymentProvider: invoice.paymentProvider
        })
      );
    }
    else{
      this.selectedStore$.pipe(
        filter(p => p.id !== -1),
        takeUntil(this.destroyed$)
      ).subscribe(p => {
        this.invoiceForm.patchValue({
          vatNumber: p.vatNumber,
        }, {emitEvent: false});
      });
      this.discountPercentage = 0;
    }
  }
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  getControl(name) {
    return this.invoiceForm.get(name);
  }

  onSaveInvoice() {
    const invoiceRequest = this.invoiceForm.getRawValue();
    invoiceRequest.storeId = this.storeId;
    invoiceRequest.paymentProvider = invoiceRequest.paymentProvider === '' ? undefined : invoiceRequest.paymentProvider;
    this.store.dispatch(new SaveInvoice(this.invoiceId, invoiceRequest));
  }

  goBack() {
    this.router.navigate(['/manager/stores/' +  this.storeId + '/billing/invoices']);
  }
  onDeleteInvoice() {
    this.store.dispatch(new DeleteInvoice(this.invoiceId));
  }

  selectCurrencyHandler($event){
    this.currencyIsoCode = $event.target.value;
  }

  selectDiscountPercentageHandler($event){
    this.discountPercentage = $event.target.value;
  }

  selectPaymentProviderHandler($event){
    this.paymentProvider = $event.target.value;
  }
}
