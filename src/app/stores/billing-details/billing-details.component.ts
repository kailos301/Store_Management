import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClientStore, ClientStoreRequest } from '../stores';
import { Store, select } from '@ngrx/store';
import { UpdateStore } from '../+state/stores.actions';
import { getSelectedStore } from '../+state/stores.selectors';
@Component({
  selector: 'app-billing-details',
  templateUrl: './billing-details.component.html',
  styleUrls: ['./billing-details.component.scss']
})
export class BillingDetailsComponent implements OnInit, OnDestroy {
  billingForm: FormGroup;
  private destroyed$ = new Subject();
  private storeData: ClientStoreRequest;

  constructor(private fb: FormBuilder, private storeState: Store<any>) { }

  ngOnInit() {
    this.storeState.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      this.storeData = {
        id: s.id,
        name: s.name,
        description: s.description,
        aliasName: s.aliasName,
        externalId: s.externalId,
        longitude: s.coordinates.longitude,
        latitude: s.coordinates.latitude,
        countryId: s.address.country.id,
        languageId: s.language.id,
        addressLine1: s.address.addressLine1,
        addressLine2: s.address.addressLine2,
        postCode: s.address.postCode,
        region: s.address.region,
        city: s.address.city,
        phoneCountryCode: s.address.country.phoneCode,
        phoneNumber: s.phoneNumber,
        timeZone: s.timeZone,
        subscription: s.subscription
      };
      this.billingForm = this.fb.group({
        companyName: [
          s.companyName,
          Validators.compose([
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50), ,
            Validators.pattern('^[^\\s]+(\\s+[^\\s]+)*$')
          ])
        ],
        vatNumber: [
          s.vatNumber,
          Validators.compose([
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50), ,
            Validators.pattern('^[^\\s]+(\\s+[^\\s]+)*$')
          ])
        ],
        companyAddressLine1: [
          s.companyAddress.addressLine1,
          Validators.required
        ],
        companyAddressLine2: [
          s.companyAddress.addressLine2,
          Validators.compose([
            Validators.minLength(1),
            Validators.maxLength(128), ,
            Validators.pattern('^[^\\s]+(\\s+[^\\s]+)*$')
          ])
        ],
        companyPostCode: [
          s.companyAddress.postCode,
          Validators.compose([
            Validators.required,
            Validators.minLength(1),
            Validators.maxLength(16)
          ])
        ],
        companyRegion: [
          s.companyAddress.region,
          Validators.compose([
            Validators.minLength(1),
            Validators.maxLength(64), ,
            Validators.pattern('^[^\\s]+(\\s+[^\\s]+)*$')
          ])
        ],
        companyCity: [
          s.companyAddress.city,
          Validators.compose([
            Validators.required,
            Validators.minLength(1),
            Validators.maxLength(64), ,
            Validators.pattern('^[^\\s]+(\\s+[^\\s]+)*$')
          ])
        ],
        companyCountryId: [s.companyAddress.country ? s.companyAddress.country.id : '']
      });
    });
  }

  getControl(name: string) {
    return this.billingForm.get(name);
  }
  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onSubmit() {
    const storeUpdateRequest = { ...this.storeData, ...this.billingForm.getRawValue()};
    this.storeState.dispatch(new UpdateStore(storeUpdateRequest));
  }
}
