import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderingRuleCategory, OrderingRuleRequest, SaveOrderingRuleView } from './store-ordering-rules.helpers';

@Injectable({
  providedIn: 'root'
})
export class StoreOrderingRulesService {

  constructor(private http: HttpClient) { }

  loadRuleCategories(id: number, catalogId: number): Observable<OrderingRuleCategory[]> {
    return this.http.get<OrderingRuleCategory[]>(`/api/v1/user/stores/${id}/catalog/${catalogId}/categories/name?level=RULE`);
  }

  loadOrderingRule(id: number, ruleId: number): Observable<SaveOrderingRuleView> {
    return this.http.get<SaveOrderingRuleView>(`/api/v1/stores/${id}/rules/${ruleId}`);
  }

  loadOrderingRules(id: number): Observable<SaveOrderingRuleView[]> {
    return this.http.get<SaveOrderingRuleView[]>(`/api/v1/stores/${id}/rules`);
  }

  saveOrderingRule(storeId: number, ruleId: number, request: OrderingRuleRequest): Observable<SaveOrderingRuleView> {
    if (+ruleId === 0) {
      return this.http.post<SaveOrderingRuleView>(`/api/v1/stores/${storeId}/rules`, request);
    } else {
      return this.http.put<SaveOrderingRuleView>(`/api/v1/stores/${storeId}/rules/${ruleId}`, request);
    }
  }

  deleteOrderingRule(storeId: number, ruleId: number): Observable<void> {
    return this.http.delete<void>(`/api/v1/stores/${storeId}/rules/${ruleId}`);
  }
}
