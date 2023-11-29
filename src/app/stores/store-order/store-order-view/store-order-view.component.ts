import { Order, StoreCatalog } from './../../stores';
import { Store, select } from '@ngrx/store';
import { Component, OnInit } from '@angular/core';
import { StoresOrdersState } from '../+state/store-order.reducer';
import { Observable } from 'rxjs';
import { getSelectedOrder } from '../+state/store-order.selector';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-store-order-view',
  templateUrl: './store-order-view.component.html',
  styleUrls: ['./store-order-view.component.scss']
})
export class StoreOrderViewComponent implements OnInit {
  order$: Observable<Order>;

  constructor(private store: Store<StoresOrdersState>) { }

  ngOnInit() {
    this.order$ = this.store.pipe(
      select(getSelectedOrder),
      filter(o => o && o.uuid !== '')
    );
  }

}
