import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OrderingRule } from './store-ordering-rules.reducer';


export const getOrderingRuleState = createFeatureSelector<OrderingRule>('orderingRule');
export const getOrderingRuleDetails = createSelector(getOrderingRuleState, (state: OrderingRule) => state.orderingRulelist.data);
export const getSelectedOrderingRule = createSelector(getOrderingRuleState, (state: OrderingRule) => state.selectedOrderingRule);
