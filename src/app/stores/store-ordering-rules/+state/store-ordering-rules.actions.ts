import { Action } from '@ngrx/store';
import { OrderingRuleRequest, SaveOrderingRuleView } from '../store-ordering-rules.helpers';

export enum StoresActionType {
    LoadOrderingRule = '[stores] LoadOrderingRule',
    LoadOrderingRuleSuccess = '[stores] LoadOrderingRuleSuccess',
    LoadOrderingRuleFailed = '[stores] LoadOrderingRuleFailed',
    LoadOrderingRules = '[stores] LoadOrderingRules',
    LoadOrderingRulesSuccess = '[stores] LoadOrderingRulesSuccess',
    LoadOrderingRulesFailed = '[stores] LoadOrderingRulesFailed',
    SaveOrderingRule = '[stores] SaveOrderingRules',
    SaveOrderingRuleSuccess = '[stores] SaveOrderingRulesSuccess',
    SaveOrderingRuleFailed = '[stores] SaveOrderingRulesFailed',
    DeleteOrderingRule = '[stores] DeleteOrderingRule',
    DeleteOrderingRuleSuccess = '[stores] DeleteOrderingRuleSuccess',
    DeleteOrderingRuleFailed = '[stores] DeleteOrderingRuleFailed',

}

export class LoadOrderingRule implements Action {
    readonly type = StoresActionType.LoadOrderingRule;
    constructor(public readonly storeId: number, public readonly ruleId: number) { }
}

export class LoadOrderingRuleSuccess implements Action {
    readonly type = StoresActionType.LoadOrderingRuleSuccess;
    constructor(public readonly orderingRule: SaveOrderingRuleView) { }

}

export class LoadOrderingRuleFailed implements Action {
    readonly type = StoresActionType.LoadOrderingRuleFailed;
    constructor(public readonly error: string) { }
}
export class LoadOrderingRules implements Action {
    readonly type = StoresActionType.LoadOrderingRules;
    constructor(public readonly storeId: number) { }
}

export class LoadOrderingRulesSuccess implements Action {
    readonly type = StoresActionType.LoadOrderingRulesSuccess;
    constructor(public readonly orderingRules: SaveOrderingRuleView[]) { }

}

export class LoadOrderingRulesFailed implements Action {
    readonly type = StoresActionType.LoadOrderingRulesFailed;
    constructor(public readonly error: string) { }
}

export class SaveOrderingRule implements Action {
    readonly type = StoresActionType.SaveOrderingRule;
    constructor(public readonly storeId: number, public readonly ruleId: number, public readonly request: OrderingRuleRequest) { }
}

export class SaveOrderingRuleSuccess implements Action {
    readonly type = StoresActionType.SaveOrderingRuleSuccess;
    constructor(public readonly storeId: number, public readonly ruleId: number, public readonly orderingRule: SaveOrderingRuleView) { }

}

export class SaveOrderingRuleFailed implements Action {
    readonly type = StoresActionType.SaveOrderingRuleFailed;
    constructor() { }
}

export class DeleteOrderingRule implements Action {
    readonly type = StoresActionType.DeleteOrderingRule;

    constructor(public readonly storeId: number, public readonly ruleId: number) { }
}

export class DeleteOrderingRuleSuccess implements Action {
    readonly type = StoresActionType.DeleteOrderingRuleSuccess;

    constructor(public readonly storeId: number) { }
}

export class DeleteOrderingRuleFailed implements Action {
    readonly type = StoresActionType.DeleteOrderingRuleFailed;

    constructor() { }
}

export type StoresAction =
    LoadOrderingRule
    | LoadOrderingRuleSuccess
    | LoadOrderingRuleFailed
    | LoadOrderingRules
    | LoadOrderingRulesSuccess
    | LoadOrderingRulesFailed
    | SaveOrderingRule
    | SaveOrderingRuleSuccess
    | SaveOrderingRuleFailed
    | DeleteOrderingRule
    | DeleteOrderingRuleSuccess
    | DeleteOrderingRuleFailed;
