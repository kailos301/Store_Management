export interface UserAffiliate {
  isAffiliate: boolean;
  status: string;
  eligibleToUpgrade: boolean;
  defaultVoucherValue: number;
  dafaultVoucherTimesUse: number;
  maxDaysVoucherDuration: number;
  maxVoucherDiscount: number;
  minVoucherDiscount: number;
  defaultVoucherDiscount: number;
  maxAvailableVouchers: number;
  remainingVouchers: number;
  defaultCurrency: string;
  paymentDetails: string;
}
