import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ClientStore } from 'src/app/stores/stores';
import { Observable, Subject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { StoresState } from '../../stores/+state/stores.reducer';
import { getSelectedStore } from '../../stores/+state/stores.selectors';
import { takeUntil } from 'rxjs/operators';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-price-input',
  templateUrl: './price-input.component.html',
  styleUrls: ['./price-input.component.scss']
})
export class PriceInputComponent implements OnInit, OnDestroy {

  selectedStore$: Observable<ClientStore>;
  priceSeparator: any;
currencyPosition: number;
  selectedStoreCurrencySymbol: string;
  private destroy$ = new Subject();
  @Input() priceFormControl: FormControl;
  @Input() allowNegValue = false;
  @Input() showCurrencySymbol = true;
  @Input() readonly = false;
  priceInputForm: FormGroup;

  constructor(private store: Store<StoresState>, private fb: FormBuilder) { }

  ngOnInit() {
    if (this.priceFormControl) {
      const price = this.priceFormControl.value;
      this.priceInputForm = this.fb.group({
        priceVal: [''],
        priceDecimalVal: ['', Validators.compose([Validators.maxLength(4), Validators.pattern('^[0-9]*$')])],
      });
      this.priceInputForm.patchValue({
        priceVal: price && price.toString().split('.')[0] ? price.toString().split('.')[0] : 0
        , priceDecimalVal: price && price.toString().split('.')[1] ? price.toString().split('.')[1] : 0
      });

      if (this.priceFormControl.validator) {
        this.getControl('priceVal').setValidators([
          this.priceFormControl.validator,
          Validators.maxLength(128)]
        );
      } else {
        this.getControl('priceVal').setValidators([Validators.maxLength(128)]);
      }
      this.getControl('priceVal').setValidators([
        this.getControl('priceVal').validator,
        Validators.pattern(this.allowNegValue ? '^0|(-?[1-9][0-9]{0,5})$' : '^0|([1-9][0-9]{0,5})$')]
      );

      this.priceFormControl.valueChanges.pipe(
        takeUntil(this.destroy$)
      ).subscribe(
        val => {
          this.priceInputForm.patchValue({
            priceVal: val && val.toString().split('.')[0] ? val.toString().split('.')[0] : 0
            , priceDecimalVal: val && val.toString().split('.')[1] ? val.toString().split('.')[1] : 0
          });
        }
      );
    }
    this.preparePriceDisplayFormat();
  }

  emitDataOnUpdateValue(e) {
    if (e.target.value) {
      this.priceFormControl.markAsTouched();
      if (this.priceInputForm.valid) {
        const finalPrice = Number(this.getControl('priceVal').value + '.' + this.getControl('priceDecimalVal').value);
        if (this.priceFormControl) {
          this.priceFormControl.setValue(finalPrice);
        }
      } else {
        this.priceFormControl.setErrors({ invalid: true });
      }
    }else {
        this.priceFormControl.setErrors({ invalid: true });
      }
  }

  getControl(name: string) {
    return this.priceInputForm.get(name);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  preparePriceDisplayFormat() {
    let selectedStore: ClientStore;
    let selectedStoreLocale: string;
    let selectedStoreCurrency: string;

    this.selectedStore$ = this.store.pipe(select(getSelectedStore));
    this.selectedStore$
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        selectedStore = value;
        if (selectedStore && selectedStore.address && selectedStore.currency && selectedStore.address.country.defaultLocale) {
          selectedStoreLocale = selectedStore.address.country.defaultLocale
            + '-'
            + selectedStore.address.country.code;
          selectedStoreCurrency = selectedStore.currency.isoCode;
          this.selectedStoreCurrencySymbol = selectedStore.currency.symbol;
          const price = 0.00;
          const formattedPrice = price.toLocaleString(
            selectedStoreLocale,
            { style: 'currency', currency: selectedStoreCurrency, currencyDisplay: 'code', useGrouping: false }
          ).replace(selectedStoreCurrency, this.selectedStoreCurrencySymbol);
          this.priceSeparator = formattedPrice.indexOf(',') > 0 || formattedPrice.indexOf('٫') > 0 ? ',' : '.';
          this.currencyPosition = formattedPrice.indexOf(this.selectedStoreCurrencySymbol);
        }
      });
  }

}
