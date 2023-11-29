import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { getSelectedStore } from '../+state/stores.selectors';
import { takeUntil } from 'rxjs/operators';
import { UpdateStoreSettings } from '../+state/stores.actions';
import { StoresState } from '../+state/stores.reducer';

@Component({
  selector: 'app-store-pickup-methods',
  templateUrl: './store-pickup-methods.component.html',
  styleUrls: ['./store-pickup-methods.component.scss']
})
export class StorePickupMethodsComponent implements OnInit, OnDestroy {
  settingsForm: FormGroup = this.fb.group({});
  destroyed$ = new Subject<void>();

  constructor(private fb: FormBuilder, private store: Store<StoresState>) {
  }

  ngOnInit() {
    this.settingsForm = this.fb.group({
      PICKUP_EMAIL_OPTIONAL: [''],
      PICKUP_TEL_OPTIONAL: [''],
      PICKUP_NAME_OPTIONAL: [''],
      DELIVERY_NO_LOCATION_SHOW_ADDRESS: ['']
    });

    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      this.settingsForm.get('DELIVERY_NO_LOCATION_SHOW_ADDRESS').setValue(s.settings.DELIVERY_NO_LOCATION_SHOW_ADDRESS);
      this.settingsForm.get('PICKUP_EMAIL_OPTIONAL').setValue(!s.settings.PICKUP_EMAIL_OPTIONAL);
      this.settingsForm.get('PICKUP_TEL_OPTIONAL').setValue(!s.settings.PICKUP_TEL_OPTIONAL);
      this.settingsForm.get('PICKUP_NAME_OPTIONAL').setValue(!s.settings.PICKUP_NAME_OPTIONAL);
    });

  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onSubmit() {
    const formObj = this.settingsForm.getRawValue();
    this.settingsForm.patchValue(formObj);
    formObj.PICKUP_EMAIL_OPTIONAL = !formObj.PICKUP_EMAIL_OPTIONAL;
    formObj.PICKUP_TEL_OPTIONAL = !formObj.PICKUP_TEL_OPTIONAL;
    formObj.PICKUP_NAME_OPTIONAL = !formObj.PICKUP_NAME_OPTIONAL;
    this.store.dispatch(new UpdateStoreSettings(formObj));
  }
}
