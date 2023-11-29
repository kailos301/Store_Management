import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { withLatestFrom, switchMap, map, catchError, tap } from 'rxjs/operators';
import { getSelectedStore } from '../../+state/stores.selectors';
import { SaveOrderingRuleView } from '../store-ordering-rules.helpers';
import { StoreOrderingRulesService } from '../store-ordering-rules.service';
import {
  LoadOrderingRules,
  LoadOrderingRulesSuccess,
  LoadOrderingRulesFailed,
  StoresActionType,
  SaveOrderingRule,
  SaveOrderingRuleSuccess,
  SaveOrderingRuleFailed,
  DeleteOrderingRule,
  DeleteOrderingRuleSuccess,
  DeleteOrderingRuleFailed,
  LoadOrderingRule,
  LoadOrderingRuleSuccess,
  LoadOrderingRuleFailed
} from './store-ordering-rules.actions';

@Injectable()
export class StoresEffects {

  constructor(
    private actions$: Actions,
    private orderingRuleService: StoreOrderingRulesService,
    private toastr: ToastrService,
    private router: Router,
    private translateSer: TranslateService
  ) { }
  @Effect()
  onLoadOrderingRule = this.actions$.pipe(
    ofType<LoadOrderingRule>(StoresActionType.LoadOrderingRule),
    switchMap((action) => this.orderingRuleService.loadOrderingRule(action.storeId, action.ruleId)
      .pipe(
        map((u: SaveOrderingRuleView) => new LoadOrderingRuleSuccess(u)),
        catchError(a => of(new LoadOrderingRuleFailed(a.error.errors.map(err => err.message))))
      ))
  );

  @Effect()
  onLoadOrderingRules = this.actions$.pipe(
    ofType<LoadOrderingRules>(StoresActionType.LoadOrderingRules),
    switchMap((action) => this.orderingRuleService.loadOrderingRules(action.storeId)
      .pipe(
        map((u: SaveOrderingRuleView[]) => new LoadOrderingRulesSuccess(u)),
        catchError(a => of(new LoadOrderingRulesFailed(a.error.errors.map(err => err.message))))
      ))
  );

  @Effect()
  onSaveOrderingRule = this.actions$.pipe(
    ofType<SaveOrderingRule>(StoresActionType.SaveOrderingRule),
    switchMap(action => this.orderingRuleService.saveOrderingRule(action.storeId, action.ruleId, action.request)
      .pipe(
        map(s => new SaveOrderingRuleSuccess(action.storeId, action.ruleId, s)),
        catchError(a => of(new SaveOrderingRuleFailed()))
      ))
  );

  @Effect({ dispatch: false })
  onSaveOrderingRuleSuccess = this.actions$.pipe(
    ofType<SaveOrderingRuleSuccess>(StoresActionType.SaveOrderingRuleSuccess),
    tap(z => {
      this.toastr.success(this.translateSer.instant('admin.store.message.saveRuleSuccess'));
      if (+z.ruleId === 0) {
        this.router.navigate([`/manager/stores/${z.storeId}/settings/ordering-rules/${z.orderingRule.id}`]);
      } else {
        this.router.navigate([`/manager/stores/${z.storeId}/settings/ordering-rules`]);
      }

    })
  );

  @Effect({ dispatch: false })
  onSaveOrderingRuleFailed = this.actions$.pipe(
    ofType<SaveOrderingRuleFailed>(StoresActionType.SaveOrderingRuleFailed),
    tap(a => this.toastr.error(this.translateSer.instant('admin.store.message.errorTryAgain')))
  );

  @Effect()
  onDeleteOrderingRule = this.actions$.pipe(
    ofType<DeleteOrderingRule>(StoresActionType.DeleteOrderingRule),
    switchMap(a => this.orderingRuleService.deleteOrderingRule(a.storeId, a.ruleId)
      .pipe(
        map(r => new DeleteOrderingRuleSuccess(a.storeId)),
        catchError(e => of(new DeleteOrderingRuleFailed()))
      )
    )
  );

  @Effect({ dispatch: false })
  onDeleteOrderingRuleSuccess = this.actions$.pipe(
    ofType<DeleteOrderingRuleSuccess>(StoresActionType.DeleteOrderingRuleSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.deleteRuleSuccess'))),
    tap(z => {
      this.router.navigate(['/manager/stores/', z.storeId, 'settings', 'ordering-rules']);
    })
  );

  @Effect({ dispatch: false })
  onDeleteOrderingRuleFailed = this.actions$.pipe(
    ofType<DeleteOrderingRuleFailed>(StoresActionType.DeleteOrderingRuleFailed),
    tap(a => this.toastr.error('OrderingRule Deletion Failed'))
  );
}
