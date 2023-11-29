export interface OutOfStockOffer {
    offerId: number;
    orderItemUuid: string;
    parentOrderItemUuid: string;
    stockQuantity: number;
    orderQuantity: number;
    deficit: number;
    offerName: string;
    parentOfferName: string;
    variantDescription: string;
}
