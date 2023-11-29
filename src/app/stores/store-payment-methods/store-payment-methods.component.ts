import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { StoresState } from '../+state/stores.reducer';
import { takeUntil } from 'rxjs/operators';
import { getSelectedStore } from '../+state/stores.selectors';
import { ClientStore } from '../stores';

@Component({
  selector: 'app-store-payment-methods',
  templateUrl: './store-payment-methods.component.html',
  styleUrls: ['./store-payment-methods.component.scss']
})
export class StorePaymentMethodsComponent implements OnInit, OnDestroy {

  selectedStore: ClientStore;
  private destroy$ = new Subject();

  constructor(private store: Store<StoresState>) { }

  ngOnInit() {
    this.store
      .select(getSelectedStore)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((state) => {
        this.selectedStore = state;
      });
  }
  ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
  }

}
