import { UserProfile } from '../api/types/User';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class AccountService {

    constructor(private http: HttpClient) { }

    get(): Observable<UserProfile> {
        return this.http.get<UserProfile>(`/api/v1/auth/profile`);
    }

    update(user: UserProfile): Observable<UserProfile> {
      return this.http.put<UserProfile>(`/api/v1/auth/profile`, user);
    }

    deleteUser(userId): Observable<any> {
      return this.http.delete<{}>(`/api/v1/users/${userId}`);
    }

    changePassword(password: string, newPassword: string): Observable<{}> {
      return this.http.post<{}>(`/api/v1/auth/profile/password/update`, {password, newPassword});
    }

    createPassword(newPassword: string): Observable<{}> {
      return this.http.post<{}>(`/api/v1/auth/profile/password/create`, {newPassword});
    }

    linkSocialAccount(accessToken: string, authProvider: string, appleCode: string): Observable<UserProfile> {
      return this.http.put<UserProfile>(`/api/v1/auth/profile/social/${authProvider}/link`, {accessToken, appleCode});
    }

    sendEmail(userId: number, message: string, storeId: number): Observable<any> {
      const requestBody = { message, storeId: storeId !== -1 ? storeId : null };
      return this.http.post('/api/v1/users/' + userId + '/store/support', requestBody);
    }
}
