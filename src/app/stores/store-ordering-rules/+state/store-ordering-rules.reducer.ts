import { combineReducers } from '@ngrx/store';
import { SaveOrderingRuleView } from '../store-ordering-rules.helpers';
import { SaveOrderingRule, StoresAction, StoresActionType } from './store-ordering-rules.actions';



export interface OrderingRuleState {
  orderingRule: OrderingRule;
}

export interface OrderingRule {
  orderingRulelist: OrderingRuleList;
  selectedOrderingRule: SaveOrderingRuleView;
}

export interface OrderingRuleList {
  status: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';
  data: SaveOrderingRuleView[];
  errorMessage: any;
}
export const orderingRuleInitialState: OrderingRule = {
  orderingRulelist: {
    status: 'INITIAL',
    data: null,
    errorMessage: ''
  },
  selectedOrderingRule: null
};

export function orderingRulelist(state: OrderingRuleList = orderingRuleInitialState.orderingRulelist, action: StoresAction)
  : OrderingRuleList {
  switch (action.type) {
    case StoresActionType.LoadOrderingRules:
      return { ...state, status: 'LOADING' };
    case StoresActionType.LoadOrderingRulesSuccess:
      return {
        status: 'LOADED',
        data: action.orderingRules,
        errorMessage: ''
      };
    case StoresActionType.LoadOrderingRulesFailed:
      return { ...orderingRuleInitialState[''], status: 'FAILED' };
    default:
      return state;
  }
}

export function selectedOrderingRule(state: SaveOrderingRuleView = orderingRuleInitialState.selectedOrderingRule, action: StoresAction)
  : SaveOrderingRuleView {
  switch (action.type) {
    case StoresActionType.LoadOrderingRuleSuccess:
      return action.orderingRule;
    case StoresActionType.LoadOrderingRuleFailed:
      return { ...orderingRuleInitialState.selectedOrderingRule };
    default:
      return state;
  }
}
const reducerOrderingRules: (state: OrderingRule, action: StoresAction) => OrderingRule = combineReducers({
  orderingRulelist,
  selectedOrderingRule
});

export function storesOrderingRuleReducer(state: OrderingRule = orderingRuleInitialState, action: StoresAction): OrderingRule {
  return reducerOrderingRules(state, action);
}
