import {
    RMSPaymentInfo,
    PaymentSenseInfo,
    StripePaymentInfo,
    JCCPaymentInfo,
    TrustPaymentsPaymentInfo
} from '../../payments/payment.types';

export interface OrderUpdateRequest {
    latitude?: number;
    longitude?: number;
    comment?: string;
    customerName?: string;
    customerUserId?: number;
    customerPhoneNumber?: string;
    customerEmail?: string;
    deliveryMethod: string;
    deliveryStreetAddress?: string;
    deliveryPostCode?: string;
    deliveryCity?: string;
    floorNumber?: string;
    deliveryComment?: string;
    wishTime?: string;
    estimatedTime?: string;
    isReady?: boolean;
    rejectReason?: string;
    uiLanguageLocale: string;
    catalogLanguageLocale: string;
    paymentStatus?: string;
    paymentMethod?: string;
    paymentInfo?: RMSPaymentInfo | PaymentSenseInfo | StripePaymentInfo | JCCPaymentInfo | TrustPaymentsPaymentInfo;
    status?: string;
    location?: number;
    validateOrder?: boolean;
    deviceIdentifier?: string;
    voucherCode?: string;
    tapId?: string;
}
