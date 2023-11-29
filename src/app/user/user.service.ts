import { UserProfile } from '../api/types/User';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, SkipSelf } from '@angular/core';
import { UserAffiliate } from '../api/types/UserAffiliate';
import { StoreVoucherRequest, Voucher, Commission } from '../stores/stores';
import { defaultPaging, PageableResults } from '../api/types/Pageable';
import { VoucherPdfResponse } from './voucher';
import { map } from 'rxjs/operators';

@Injectable()
export class UserService {

  constructor(private http: HttpClient) { }

  addUserAffiliate(userId: number): Observable<{}> {
    return this.http.post<{}>('/api/v1/users/' + userId + '/affiliate', {});
  }

  getUserAffiliate(userId: number): Observable<UserAffiliate> {
    return this.http.get<UserAffiliate>(`/api/v1/users/${userId}/affiliate`);
  }

  updateAffiliate(userId: number, status: string, paymentDetails: string) {
    return this.http.put<any>(`/api/v1/users/${userId}/affiliate`, { status, paymentDetails });
  }

  voucherList(id: any, paging = defaultPaging): Observable<PageableResults<Voucher>> {
    // tslint:disable-next-line
    return this.http.get<PageableResults<Voucher>>(`/api/v1/users/${id}/affiliate/voucher/available?page=${paging.page}&size=${paging.size}`);
  }

  commissionList(id: any, paging = defaultPaging): Observable<PageableResults<Commission>> {
    return this.http.get<PageableResults<Commission>>(`/api/v1/users/${id}/affiliate/voucher/assignments?page=${paging.page}&size=${paging.size}`);
  }

  createVoucher(id: number, voucher: StoreVoucherRequest): Observable<any> {
    return this.http.post<Voucher>(`/api/v1/users/${id}/affiliate/voucher`, voucher);
  }

  updateVoucher(userId: number, voucherId: number, voucher: StoreVoucherRequest): Observable<any> {
    return this.http.put<Voucher>(`/api/v1/users/${userId}/affiliate/voucher/${voucherId}`, voucher);
  }

  getVoucherPaymentMethod(id: number, code: string): Observable<string> {
    return this.http.get(`/api/v1/refdata/payment-method-comment?countryCode=${code}`, { responseType: 'text' });
  }

  downloadVoucherPdf(userId: number, languageLocale: string, countryCode: string, voucherCode: string): Observable<VoucherPdfResponse> {
    const request = {
      voucherCode,
      countryCode,
      languageLocale
    };
    return this.http.post(`/api/v1/users/${userId}/affiliate/voucher/pdf`, request, {
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map(r => this.toVoucherCodeResponse(r, voucherCode))
    );
  }

  private toVoucherCodeResponse(response: HttpResponse<Blob>, voucherCode: string): VoucherPdfResponse {
    const blob = response.body;
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition.slice(contentDisposition
                    .indexOf('filename=') + 9)
                    .replace(/"/g, '')
                    .replace('voucher', 'voucher-' + voucherCode);
    return { blob, filename };
  }
}
