import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';
import { helpPage } from 'src/app/shared/help-page.const';
import { ExtendSubscriptionPurchase } from '../+state/store-subscriptions.actions';
import { getSelectedStore } from '../../+state/stores.selectors';

@Component({
  selector: 'app-extend-subscription-purchase',
  templateUrl: './extend-subscription-purchase.component.html',
  styleUrls: ['./extend-subscription-purchase.component.scss']
})
export class ExtendSubscriptionPurchaseComponent implements OnInit, OnDestroy {

  extendSubsPurchaseForm: FormGroup;
  subscriptionPurchaseHelpPage = helpPage.subscription;
  subsEndDate: Date;
  storeId: any;
  destroyed$ = new Subject<void>();

  constructor(private fb: FormBuilder, private store: Store<any>, private actRouter: ActivatedRoute) { }

  ngOnInit() {
    let tag: string;
    this.storeId = this.actRouter.snapshot.params.id;
    const selectedStore$ = this.store.pipe(select(getSelectedStore), tap(s => tag = s.tag));
    const subscription$ = selectedStore$.pipe(filter(s => !!s.subscription), map(s => s.subscription));
    subscription$.pipe(takeUntil(this.destroyed$)).subscribe(s => {
      this.subsEndDate = s.endDate ? new Date(s.endDate) : new Date();
    });
    this.extendSubsPurchaseForm = this.fb.group({
      subscriptionEndDate: [this.subsEndDate ? this.subsEndDate : '', Validators.required],
      tag: [tag ? tag : 'undefined']
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  getControl(name) {
    return this.extendSubsPurchaseForm.get(name);
  }

  onChange($event) {
    this.getControl('subscriptionEndDate').setValue($event.value);
  }

  onSaveSubscription() {
    const request = this.extendSubsPurchaseForm.getRawValue();
    this.store.dispatch(new ExtendSubscriptionPurchase(this.storeId, request));
  }
}
