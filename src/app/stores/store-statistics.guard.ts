import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { LoadOrderItemsStatisticsPage, LoadStoreStatistics } from './+state/stores.actions';
import moment from 'moment';
import { filter, map, tap } from 'rxjs/operators';
import { getSelectedStore } from './+state/stores.selectors';
import { LoadCatalog } from './store-catalog/+state/stores-catalog.actions';

@Injectable({
  providedIn: 'root'
})
export class StoreStatisticsGuard implements CanActivate {

  constructor(private store: Store<any>) { }

  canActivate(route: ActivatedRouteSnapshot) {
    const periodicTerm = 'MONTHLY';
    const id = route.params.id;
    return this.store.pipe(
      select(getSelectedStore),
      filter(l => l.id > 0),
      tap(_ => this.store.dispatch(new LoadStoreStatistics(6, moment().subtract(6, 'months').startOf('month').format('YYYY-MM-DD'),
        moment().endOf('month').format('YYYY-MM-DD'), periodicTerm))),
      tap(_ => this.store.dispatch(
        new LoadOrderItemsStatisticsPage(
          id, moment().subtract(6, 'months').startOf('month').format('YYYY-MM-DDTHH:mm:ss[Z]'),
          moment().endOf('month').format('YYYY-MM-DDTHH:mm:ss[Z]'),
          'ORDER_DATE', { page: 0, size: 10 },
          'totalDiscountedPrice,desc'
        )
      )),
      tap(_ => this.store.dispatch(new LoadCatalog(id))),
      map(l => true)
    );
  }
}
