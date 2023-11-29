import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { defaultPaging, PageableResults } from 'src/app/api/types/Pageable';
import { DiscountVoucherRequest, SaveDiscountVoucherView } from './store-discountvoucher.helpers';

@Injectable({
  providedIn: 'root'
})
export class StoreDiscountvoucherService {

  constructor(private http: HttpClient) { }

  loadDiscountVoucher(id: number, discountVoucherId: number): Observable<SaveDiscountVoucherView> {
    return this.http.get<SaveDiscountVoucherView>(`/api/v1/stores/${id}/customer-voucher/${discountVoucherId}`);
  }

  loadDiscountVouchers(id: number, paging= defaultPaging): Observable<PageableResults<SaveDiscountVoucherView>> {
    return this.http.get<PageableResults<SaveDiscountVoucherView>>(`/api/v1/stores/${id}/customer-voucher?page=${paging.page}&size=${paging.size}`);
  }
  saveDiscountVoucher(storeId: number, discountVoucherId: number, request: DiscountVoucherRequest): Observable<SaveDiscountVoucherView> {
    if (+discountVoucherId === 0) {
      return this.http.post<SaveDiscountVoucherView>(`/api/v1/stores/${storeId}/customer-voucher`, request);
    } else {
      return this.http.put<SaveDiscountVoucherView>(`/api/v1/stores/${storeId}/customer-voucher/${discountVoucherId}`, request);
    }
  }

  deleteDiscountVoucher(storeId: number, discountVoucherId: number): Observable<void> {
    return this.http.delete<void>(`/api/v1/stores/${storeId}/customer-voucher/${discountVoucherId}`);
  }
}
