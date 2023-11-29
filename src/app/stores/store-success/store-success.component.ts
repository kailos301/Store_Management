import { Component, OnInit, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoresState } from '../+state/stores.reducer';
import { getSelectedStore } from '../+state/stores.selectors';

@Component({
  selector: 'app-store-success',
  templateUrl: './store-success.component.html',
  styleUrls: ['./store-success.component.scss']
})
export class StoreSuccessComponent implements OnInit, OnDestroy {
  destroyed$ = new Subject<void>();
  storeName = '';
  storeId: number;
  constructor(private store: Store<StoresState>) { }

  ngOnInit() {
    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      this.storeName = s.name;
      this.storeId = s.id;
    });
  }
  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  openNewTab(url) {
    window.open(url, '_blank');
  }
}
