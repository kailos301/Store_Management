export interface CustomerVoucher {
    id: number;
    code: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
    discount: number;
    type: string;
    discountType: string;
    storeId: number;
    isActive: boolean;
    isConsumed: boolean;
}
