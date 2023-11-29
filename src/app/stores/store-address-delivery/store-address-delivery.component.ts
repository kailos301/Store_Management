import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StoresState } from '../+state/stores.reducer';
import { Store, select } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { PartialUpdateStore, UpdateStoreSettings } from '../+state/stores.actions';
import { getSelectedStore, getStoreZones, getStoreZoneStatus } from '../+state/stores.selectors';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-store-address-delivery',
  templateUrl: './store-address-delivery.component.html',
  styleUrls: ['./store-address-delivery.component.scss']
})
export class StoreAddressDeliveryComponent implements OnInit, OnDestroy {
  addressDeliveryForm: FormGroup = this.fb.group({});
  destroyed$ = new Subject<void>();
  storeId: any;
  paramsSubscription: any;
  enableRestriction: boolean;
  zones$: Observable<any>;
  @ViewChild('createzone') createzone: TemplateRef<any>;
  constructor(private router: Router, private fb: FormBuilder, private store: Store<StoresState>, public dialog: MatDialog) {
  }

  ngOnInit() {
    this.zones$ = this.store.pipe(select(getStoreZones));
    this.addressDeliveryForm = this.fb.group({
      orderMinAmountDelivery: ['', Validators.compose([Validators.required, Validators.maxLength(128), Validators.pattern('^[0-9].*$')])],
      orderFeeDelivery: ['', Validators.compose([Validators.required, Validators.maxLength(128), Validators.pattern('^[0-9].*$')])],
      orderAmountFreeDelivery: ['', Validators.compose([Validators.required, Validators.maxLength(128), Validators.pattern('^[0-9].*$')])],
      DELIVERY_ADDRESS_AUTOCOMPLETE: [''],
      FLOOR_NUMBER_VISIBILITY: [''],
      setup_zone: [''],
      DELIVERY_ZONE_RESTRICTION: [''],
      DELIVERY_FEE_EXTERNAL_ID: ['', Validators.compose([Validators.maxLength(100)])]
    });

    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      this.storeId = s.id;
      if (s && s.settings && Object.keys(s.settings).length > 0) {
        this.addressDeliveryForm.get('orderMinAmountDelivery').setValue(s.orderMinAmountDelivery, { onlySelf: true });
        this.addressDeliveryForm.get('orderFeeDelivery').setValue(s.orderFeeDelivery, { onlySelf: true });
        this.addressDeliveryForm.get('orderAmountFreeDelivery').setValue(s.orderAmountFreeDelivery, { onlySelf: true });
        this.addressDeliveryForm.get('DELIVERY_ADDRESS_AUTOCOMPLETE').setValue(s.settings.DELIVERY_ADDRESS_AUTOCOMPLETE,
                                                                              { onlySelf: true });
        this.addressDeliveryForm.get('DELIVERY_ZONE_RESTRICTION').setValue(s.settings.DELIVERY_ZONE_RESTRICTION, { onlySelf: true });
        this.addressDeliveryForm.get('FLOOR_NUMBER_VISIBILITY').setValue(s.settings.FLOOR_NUMBER_VISIBILITY, { onlySelf: true });
        this.addressDeliveryForm.get('DELIVERY_FEE_EXTERNAL_ID').setValue(s.settings.DELIVERY_FEE_EXTERNAL_ID, { onlySelf: true });
      }
    });

    this.store.pipe(
      select(getStoreZoneStatus),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      if (s) {
        this.enableRestriction = s.enableRestriction;
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  openCreateZoneDialog(): void {
    const dialogRef = this.dialog.open(this.createzone, {
      width: '30%'
    });

  }
  onPartialSubmit() {
    if (this.addressDeliveryForm.valid) {
      const {
        DELIVERY_ADDRESS_AUTOCOMPLETE,
        DELIVERY_ZONE_RESTRICTION,
        setup_zone,
        FLOOR_NUMBER_VISIBILITY,
        DELIVERY_FEE_EXTERNAL_ID,
        ...priceFormValues
      } = this.addressDeliveryForm.getRawValue();
      this.store.dispatch(new PartialUpdateStore(priceFormValues));
    }
  }

  getControl(name: string) {
    return this.addressDeliveryForm.get(name);
  }

  gotoZone(id = 0, type) {
    // tslint:disable-next-line
    this.router.navigate([`/manager/stores/${this.storeId}/settings/zoneview/${id}`], { queryParams: { type } });
  }
  gotoSetupZone() {
    if (this.getControl('setup_zone').value) {
      this.router.navigate(
        [`/manager/stores/${this.storeId}/settings/zone/0`],
        { queryParams: { type: this.getControl('setup_zone').value }}
      );
    }
    this.dialog.closeAll();
  }
  onSubmit() {
    if (this.getControl('DELIVERY_FEE_EXTERNAL_ID').invalid || this.getControl('DELIVERY_FEE_EXTERNAL_ID').errors) {
      return;
    }
    const {
      orderMinAmountDelivery,
      orderFeeDelivery,
      orderAmountFreeDelivery,
      setup_zone,
      ...addressDeliveryValues
    } = this.addressDeliveryForm.getRawValue();
    this.store.dispatch(new UpdateStoreSettings(addressDeliveryValues));
  }

}
