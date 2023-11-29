import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { StoresState } from '../+state/stores.reducer';
import { takeUntil } from 'rxjs/operators';
import { getSelectedStore } from '../+state/stores.selectors';
import { ClientStore } from '../stores';

@Component({
  selector: 'app-store-integrations',
  templateUrl: './store-integrations.component.html',
  styleUrls: ['./store-integrations.component.scss']
})
export class StoreIntegrationsComponent implements OnInit, OnDestroy{

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
