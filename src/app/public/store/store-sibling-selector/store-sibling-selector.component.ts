import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ClientStore } from 'src/app/stores/stores';

import { SelectedStoreState } from '../+state/stores.reducer';
import { getSelectedStore } from '../+state/stores.selectors';

import { LocationService } from '../../location.service';

import { LoadStore } from '../+state/stores.actions';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-store-sibling-selector',
  templateUrl: './store-sibling-selector.component.html',
  styleUrls: ['./store-sibling-selector.component.scss']
})
export class StoreSiblingSelectorComponent implements OnInit, OnDestroy {

  siblings: any[] = [];
  selectedSibling = {
    storeId: 0,
    storeAlias: null,
    storeName: null,
  };
  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private store: Store<SelectedStoreState>,
    private locationService: LocationService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.store
      .select(getSelectedStore)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((store) => {
        this.selectedSibling = {storeId: store.id, storeAlias: store.aliasName, storeName: store.name};
        this.siblings = [
          this.selectedSibling,
          ...store.relation.siblingStores.filter((sibling) => !sibling.isIndependent),
        ];
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  siblingSelected() {
    if (this.locationService.isOrderCapture()) {
      this.router.navigateByUrl(`/manager/stores/${this.selectedSibling.storeId}/capture/${this.selectedSibling.storeAlias}`);
      this.store.dispatch(new LoadStore(this.selectedSibling.storeAlias));
      this.locationService.orderUuid = null;
    } else {
      if (environment.name === 'production') { // Redirecting to gonnaorder domain if PROD
        const domain = 'gonnaorder.com';
        window.location.href =
        window.location.protocol + '//' +
        this.selectedSibling.storeAlias +
        '.' + domain;
      } else {
        window.location.href =
        window.location.protocol + '//' +
        this.selectedSibling.storeAlias +
        '.' +
        window.location.host.split('.').slice(1).join('.');
      }
    }
  }
}
