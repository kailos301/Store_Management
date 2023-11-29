import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs';

import { PageableResults, Paging, defaultPaging } from '../api/types/Pageable';
import {
  ClientUser
} from './users';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http: HttpClient) { }

  list(paging = defaultPaging): Observable<PageableResults<ClientUser>> {
    return this.http.get<PageableResults<ClientUser>>(`/api/v1/users/list?page=${paging.page}&size=${paging.size}`);
  }

  search(email: string): Observable<PageableResults<ClientUser>> {
    return this.http.post<PageableResults<ClientUser>>(`/api/v1/users/search`, {email});
  }

  load(id: number): Observable<ClientUser> {
    return this.http.get<ClientUser>(`/api/v1/users/pk/${id}`);
  }

  setUserEmailStatus(id: number, emailStatus: string): Observable<any> {
    return this.http.patch<any>(`/api/v1/users/${id}`, `"${emailStatus}"`, {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    });
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`/api/v1/users/${id}`);
  }
}
