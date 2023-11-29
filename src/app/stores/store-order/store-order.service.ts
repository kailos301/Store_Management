import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BulkOrderUpdateRequest, ClientStoreOrder, ClientStoreOrderStatus, OrderPdfResponse } from './store-order';
import { map } from 'rxjs/operators';
import { PageableResults, Paging } from 'src/app/api/types/Pageable';
import { Order } from '../stores';
import {
  DateTimeRangeMode,
  DateTimeRangeType,
  TabSortFilterParams,
} from '../+state/stores.reducer';
import printJS from 'print-js';


@Injectable({
  providedIn: 'root'
})
export class StoreOrderService {

  constructor(private http: HttpClient) { }

  public listOpen(storeId: number): Observable<ClientStoreOrder[]> {
    return this.http.get<PageableResults<ClientStoreOrder>>(`/api/v1/stores/${storeId}/orders?status=SUBMITTED&status=RECEIVED&sort=createdAt,desc`)
      .pipe(map(results => results.data));
  }

  public list(storeId: number, status: ClientStoreOrderStatus[], paging?: Paging): Observable<PageableResults<ClientStoreOrder>> {
    const params = {
      status,
      page: (paging && paging.page) as unknown as string,
      size: (paging && paging.size) as unknown as string,
      sort: 'createdAt,desc'
    };
    return this.http.get<PageableResults<ClientStoreOrder>>(`/api/v1/stores/${storeId}/orders`, { params });
  }

  public listWithSortFilterParams(
    storeId: number,
    tabName: string,
    tabSortFilterParams: TabSortFilterParams,
    paging: Paging,
  ): Observable<PageableResults<ClientStoreOrder>> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');

    let status = [];
    let params = {};
    const deliveryMethod = [];
    const queryStr = `?size=${paging.size}&page=${paging.page}&sort=${tabSortFilterParams.sortQuery}`;
    if (tabSortFilterParams.isServe) { deliveryMethod.push('IN_STORE_LOCATION'); }
    if (tabSortFilterParams.isPickup) { deliveryMethod.push('NO_LOCATION'); }
    if (tabSortFilterParams.isAddress) { deliveryMethod.push('ADDRESS'); }
    if (deliveryMethod.length > 0) { params = { ...params, deliveryMethod }; }
    if (tabSortFilterParams.customerName !== '') {
      params = {
        ...params,
        customerName: tabSortFilterParams.customerName,
      };
    }
    if (tabSortFilterParams.orderToken !== '') {
      params = {
        ...params,
        orderToken: tabSortFilterParams.orderToken,
      };
    }
    if (tabSortFilterParams.locationId !== '' && tabSortFilterParams.locationId !== '-1') {
      params = {
        ...params,
        locationId: tabSortFilterParams.locationId,
      };
    }
    if (tabSortFilterParams.openTap) {
      params = {
        ...params,
        openTap: tabSortFilterParams.openTap,
      };
    }
    switch (tabName) {
      case 'OPEN':
        status = Object.assign([], ['SUBMITTED', 'RECEIVED']);
        params = {
          ...params,
          status: [...status],
        };
        break;
      case 'REJECTED':
        status = Object.assign([], ['CANCELLED']);
        params = {
          ...params,
          status: [...status],
        };
        break;
      case 'CONFIRMED':
        status = Object.assign([], ['CLOSED']);
        params = {
          ...params,
          status: [...status],
          isReady: false,
        };
        break;
      case 'READY':
        status = Object.assign([], ['CLOSED']);
        params = {
          ...params,
          status: [...status],
          isReady: true,
        };
        break;
    }

    if (
      tabSortFilterParams.dateTimeRangeFrom !== DateTimeRangeType.NoFilter &&
      tabSortFilterParams.dateTimeRangeTo !== DateTimeRangeType.NoFilter
    ) {

      let applyDateTimeRangeFilter = true;

      let fromRelative = false;
      let toRelative = false;
      let from: any;
      let to: any;

      const now = new Date();

      const yesterdayFrom = new Date(now);
      yesterdayFrom.setDate(yesterdayFrom.getDate() - 1);
      yesterdayFrom.setHours(0, 0, 0, 0);

      const yesterdayTo = new Date(now);
      yesterdayTo.setDate(yesterdayTo.getDate() - 1);
      yesterdayTo.setHours(23, 59, 59, 999);

      const todayFrom = new Date(now);
      todayFrom.setHours(0, 0, 0, 0);

      const todayTo = new Date(now);
      todayTo.setHours(23, 59, 59, 999);

      const tomorrowFrom = new Date(now);
      tomorrowFrom.setDate(tomorrowFrom.getDate() + 1);
      tomorrowFrom.setHours(0, 0, 0, 0);

      const tomorrowTo = new Date(now);
      tomorrowTo.setDate(tomorrowTo.getDate() + 1);
      tomorrowTo.setHours(23, 59, 59, 999);

      switch (tabSortFilterParams.dateTimeRangeFrom) {
        case DateTimeRangeType.Yesterday:
          fromRelative = false;
          from = yesterdayFrom.toISOString();
          break;
        case DateTimeRangeType.LastHour:
          fromRelative = true;
          from = -60;
          break;
        case DateTimeRangeType.Today:
          fromRelative = false;
          from = todayFrom.toISOString();
          break;
        case DateTimeRangeType.Now:
          fromRelative = true;
          from = 0;
          break;
        case DateTimeRangeType.NextHour:
          fromRelative = true;
          from = 60;
          break;
        case DateTimeRangeType.Tomorrow:
          fromRelative = false;
          from = tomorrowFrom.toISOString();
          break;
        case DateTimeRangeType.Custom:
          fromRelative = false;
          from = tabSortFilterParams.customDateFrom;
          applyDateTimeRangeFilter = (from === '') ? false : true;
          break;
      }

      switch (tabSortFilterParams.dateTimeRangeTo) {
        case DateTimeRangeType.Yesterday:
          toRelative = false;
          to = yesterdayTo.toISOString();
          break;
        case DateTimeRangeType.LastHour:
          toRelative = true;
          to = -60;
          break;
        case DateTimeRangeType.Today:
          toRelative = false;
          to = todayTo.toISOString();
          break;
        case DateTimeRangeType.Now:
          toRelative = true;
          to = 0;
          break;
        case DateTimeRangeType.NextHour:
          toRelative = true;
          to = 60;
          break;
        case DateTimeRangeType.Tomorrow:
          toRelative = false;
          to = tomorrowTo.toISOString();
          break;
        case DateTimeRangeType.Custom:
          toRelative = false;
          to = tabSortFilterParams.customDateTo;
          applyDateTimeRangeFilter = (to === '') ? false : true;
          break;
      }

      if (applyDateTimeRangeFilter) {
        switch (tabSortFilterParams.dateTimeRangeMode) {
          case DateTimeRangeMode.OrderSent:
            if (fromRelative) {
              params = {
                ...params,
                relativeCreatedAtFrom: from,
              };
            } else {
              params = {
                ...params,
                createdAtFrom: from,
              };
            }
            if (toRelative) {
              params = {
                ...params,
                relativeCreatedAtTo: to,
              };
            } else {
              params = {
                ...params,
                createdAtTo: to,
              };
            }
            break;
          case DateTimeRangeMode.OrderWish:
            if (fromRelative) {
              params = {
                ...params,
                relativeWishTimeFrom: from,
              };
            } else {
              params = {
                ...params,
                wishTimeFrom: from,
              };
            }
            if (toRelative) {
              params = {
                ...params,
                relativeWishTimeTo: to,
              };
            } else {
              params = {
                ...params,
                wishTimeTo: to,
              };
            }
            break;
          case DateTimeRangeMode.OrderExpected:
            if (fromRelative) {
              params = {
                ...params,
                relativeEstimatedTimeFrom: from,
              };
            } else {
              params = {
                ...params,
                estimatedTimeFrom: from,
              };
            }
            if (toRelative) {
              params = {
                ...params,
                relativeEstimatedTimeTo: to,
              };
            } else {
              params = {
                ...params,
                estimatedTimeTo: to,
              };
            }
            break;
          case DateTimeRangeMode.OrderEffective:
            if (fromRelative) {
              params = {
                ...params,
                relativeEffectiveTimeFrom: from,
              };
            } else {
              params = {
                ...params,
                effectiveTimeFrom: from,
              };
            }
            if (toRelative) {
              params = {
                ...params,
                relativeEffectiveTimeTo: to,
              };
            } else {
              params = {
                ...params,
                effectiveTimeTo: to,
              };
            }
            break;
        }
      }
    }

    return this.http.post<PageableResults<ClientStoreOrder>>(
      `/api/v1/stores/${storeId}/orders/search${queryStr}`,
      { ...params },
      { headers }
    );
  }

  public updateStatus(
    storeId: number,
    orderUuid: string,
    status: ClientStoreOrderStatus,
    rejectReason: string,
    estimatedTime: Date,
    isReady: boolean,
  ): Observable < void > {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    return this.http.patch < void > (`/api/v2/user/stores/${storeId}/orders/${orderUuid}`, {
      status,
      rejectReason,
      estimatedTime,
      isReady
    }, {
      headers
    });
  }

  public onUpdateBulkOrderStatus(
    storeId: number,
    bulkOrderUpdateRequest: BulkOrderUpdateRequest,
  ): Observable<void> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    return this.http.patch<void>(`/api/v2/user/stores/${storeId}/orders/bulk`, bulkOrderUpdateRequest, { headers });
  }

  public get(storeId: number, orderUuid: string): Observable<Order> {
    return this.http.get<Order>(`/api/v1/stores/${storeId}/orders/${orderUuid}`);
  }

  public getOrders(storeId: number, orderUuids: any[]): Observable<Order> {
    return this.http.get<Order>(`/api/v1/stores/${storeId}/combinedorders?orderIds=${orderUuids}`);
  }

  downloadOrderPdf(storeId: number, orderId: string): Observable<OrderPdfResponse> {
    return this.http.get(`/api/v1/stores/${storeId}/orders/${orderId}/invoice`, {
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map(r => this.toOrderCodeResponse(r))
    );
  }

  private toOrderCodeResponse(response: HttpResponse<Blob>): OrderPdfResponse {
    const blob = response.body;
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition.slice(contentDisposition.indexOf('filename=') + 9).replace(/"/g, '');
    return { blob, filename };
  }

  printBlobPDF(blob: Blob, filename: string) {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      let pdfBase64: string = reader.result as string;
      pdfBase64 = pdfBase64.substr(pdfBase64.indexOf(',') + 1);
      printJS({
        printable: pdfBase64,
        type: 'pdf',
        base64: true,
        onError: (error) => {
          console.log(error);
          // If `DOMException : Blocked frame from accessing from cross-origin frame` is thrown,
          // then we try below code to open the Blob in default PdfViewer
          const data = URL.createObjectURL(new Blob([blob], {type: 'application/pdf'}));
          const link = document.createElement('a');
          link.href = data;
          link.click();
          setTimeout(() => {
            // For Firefox it is necessary to delay revoking the ObjectURL
            URL.revokeObjectURL(data);
          }, 100);
        }
      });
    };
  }

  downloadCombinedOrderPdf(storeId: number, orderIds: any): Observable<OrderPdfResponse> {
    return this.http.get(`/api/v1/stores/${storeId}/orders/invoice?orderIds=${orderIds}`, {
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map(r => this.toOrderCodeResponse(r))
    );
  }
}
