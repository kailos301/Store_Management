import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UpdateStoreSettings, UpdateStoreVatPercentage } from '../+state/stores.actions';
import { StoresState } from '../+state/stores.reducer';
import { getSelectedStore } from '../+state/stores.selectors';

@Component({
  selector: 'app-store-default-catalog',
  templateUrl: './store-default-catalog.component.html',
  styleUrls: ['./store-default-catalog.component.scss']
})
export class StoreDefaultCatalogComponent implements OnInit, OnDestroy {

  storeId: number;
  settingsForm: FormGroup = this.fb.group({});
  destroyed$ = new Subject<void>();
  constructor(private fb: FormBuilder, private store: Store<StoresState>) { }

  ngOnInit() {
    this.settingsForm = this.fb.group({
      DEFAULT_VAT_PERCENTAGE: [0, Validators.compose([ Validators.min(0), Validators.max(100) ])],
      CATALOG_CATEGORIES_COLLAPSE: [false],
      STOCK_MANAGEMENT: ['']
    });
    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      this.storeId = s.id;
      this.settingsForm.get('DEFAULT_VAT_PERCENTAGE').setValue(s.vatPercentage ? s.vatPercentage : 0);
      this.settingsForm.get('CATALOG_CATEGORIES_COLLAPSE').setValue(!s.settings.CATALOG_CATEGORIES_COLLAPSE);
      this.settingsForm.get('STOCK_MANAGEMENT').setValue(s.settings.STOCK_MANAGEMENT);
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onSubmit(isVatUpdate = false) {
    const formObj = this.settingsForm.getRawValue();
    this.settingsForm.patchValue(formObj);
    if (isVatUpdate) {
      if (this.settingsForm.valid) {
        this.store.dispatch(new UpdateStoreVatPercentage(formObj.DEFAULT_VAT_PERCENTAGE));
      }
    } else {
      delete formObj.DEFAULT_VAT_PERCENTAGE;
      formObj.CATALOG_CATEGORIES_COLLAPSE = !formObj.CATALOG_CATEGORIES_COLLAPSE;
      formObj.STOCK_MANAGEMENT = formObj.STOCK_MANAGEMENT;
      this.store.dispatch(new UpdateStoreSettings(formObj));
    }
  }

  getControl(name: string) {
    return this.settingsForm.get(name);
  }
}
