export interface SaveDiscountVoucherView {
    id: number;
    code: string;
    discount: number;
    discountType: string;
    endDate: string;
    isActive: boolean;
    isConsumed: boolean;
    startDate: string;
    type: string;
    storeId: number;
    createdAt: string;
    updatedAt: string;
    initialValue: number;
}

export interface DiscountVoucherRequest {
    code: string;
    discount: number;
    discountType: string;
    initialValue: string;
    endDate: string;
    isActive: boolean;
    isConsumed: boolean;
    startDate: string;
    type: string;
}


