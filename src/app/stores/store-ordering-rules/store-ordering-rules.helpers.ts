
export interface SaveOrderingRuleView {
    id: number;
    actions: OrderingRuleAction[];
    conditions: OrderingRuleCondition[];
    isActive: boolean;
}

export interface OrderingRuleAction {
    type: string;
    data: OrderingRuleCategory;
}

export interface OrderingRuleCategory {
    categoryId: number;
    name: string;
    offers: OrderingRuleOffer[];
}
export interface OrderingRuleOffer {
    offerId: number;
    categoryId: number;
    name: string;
    price: number;
    isOrderable: boolean;
}

export interface OrderingRuleCondition {
    type: string;
    data: OrderingRuleConditionRange;
}

export interface OrderingRuleConditionRange {
    min: number;
    max: number;
}

export interface OrderingRuleRequest {
    conditionMinOrderAmount: number;
    conditionMaxOrderAmount: number;
    actionAddFreeCategoryId: number;
    isActive: boolean;
}

export interface OrderingRuleCategory {
    categoryId: number;
    name: string;
    hierarchyLevel: string;
}
export interface OrderingRuleOfferObj {
    offerId?: number;
    categoryId?: number;
    name?: string;
    price?: number;
    isOrderable?: boolean;
}

