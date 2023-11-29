import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrderingRuleState } from '../+state/store-ordering-rules.reducer';
import { getOrderingRuleDetails } from '../+state/store-ordering-rules.selectors';
import { StoresState } from '../../+state/stores.reducer';
import { getSelectedStore } from '../../+state/stores.selectors';
import { ClientStore } from '../../stores';
import { SaveOrderingRuleView } from '../store-ordering-rules.helpers';

@Component({
  selector: 'app-store-ordering-rules-view',
  templateUrl: './store-ordering-rules-view.component.html',
  styleUrls: ['./store-ordering-rules-view.component.scss']
})
export class StoreOrderingRulesViewComponent implements OnInit {

  storeid: number;
  destroyed$ = new Subject<void>();
  orderingRules$: Observable<SaveOrderingRuleView[]>;
  selectedStore$: Observable<ClientStore>;
  constructor(
    private orderingRule: Store<OrderingRuleState>,
    private actRouter: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.storeid = this.actRouter.snapshot.parent.parent.params.id;
    this.selectedStore$ = this.orderingRule.pipe(select(getSelectedStore));
    this.orderingRules$ = this.orderingRule.pipe(select(getOrderingRuleDetails));
  }

  gotoRule(id) {
    this.router.navigate([`/manager/stores/${this.storeid}/settings/ordering-rules/${id}`]);
  }
}
