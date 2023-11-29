import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { StoresState } from '../+state/stores.reducer';
import { Store, select } from '@ngrx/store';
import { getSelectedStore } from '../+state/stores.selectors';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UpdateStoreSettings } from './../+state/stores.actions';
import { TableOrderingSetting } from './../+state/stores.reducer';

@Component({
  selector: 'app-store-table-ordering',
  templateUrl: './store-table-ordering.component.html',
  styleUrls: ['./store-table-ordering.component.scss']
})
export class StoreTableOrderingComponent implements OnInit, OnDestroy {
  settingsForm: FormGroup = this.fb.group({});
  settings: { [key: string]: any };
  destroyed$ = new Subject<void>();

  constructor(private fb: FormBuilder, private store: Store<StoresState>) {
  }

  ngOnInit() {
    this.settingsForm = this.fb.group({
      DELIVERY_IN_STORE_LOCATION_SELECTION_NAME: [''],
      DELIVERY_IN_STORE_LOCATION_SELECTION_EMAIL: [''],
      DELIVERY_IN_STORE_LOCATION_SELECTION_TEL: [''],
      DEFUALT_LOCATION_TYPE: [null],
      OPEN_TAP: false
    });

    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      this.settings = s.settings;
      this.settingsForm.patchValue(s.settings);
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onLocationTypeChanged(event) {
    this.settingsForm.value.DEFUALT_LOCATION_TYPE = event.target.value;
    this.onSubmit();
  }

  public get TableOrderingSetting(): typeof TableOrderingSetting {
    return TableOrderingSetting;
  }

  onSubmit() {
    this.store.dispatch(new UpdateStoreSettings(this.settingsForm.getRawValue()));
  }

}
