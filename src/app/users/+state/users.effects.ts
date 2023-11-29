import { Router } from '@angular/router';
import { Injectable, Inject } from '@angular/core';

import { Store, select } from '@ngrx/store';
import { Effect, Actions, ofType, OnInitEffects } from '@ngrx/effects';
import { switchMap, map, catchError, tap, withLatestFrom, filter } from 'rxjs/operators';
import { of, timer } from 'rxjs';

import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

import { Paging } from 'src/app/api/types/Pageable';
import { LocalStorageService } from 'src/app/local-storage.service';
import { PushNotificationService } from 'src/app/shared/push-notification.service';

import {
  InitializeState,
  LoadUsers,
  LoadUsersSuccess,
  LoadUsersFailed,
  SearchUser,
  UsersAction,
  UsersActionType,
  LoadUser,
  LoadUserSuccess,
  LoadUserFailed,
  SetUserEmailStatus,
  SetUserEmailStatusSuccess,
  DeleteUser,
  DeleteUserSuccess,
} from './users.actions';
import { SelectedUserState } from './users.reducer';

import { UsersService } from './../users.service';
import { USERS_LOCAL_STORAGE_KEY } from './../users.tokens';

@Injectable()
export class UsersEffects implements OnInitEffects {

  constructor(
    private actions$: Actions,
    // private user: Store<UsersState>,
    private usersService: UsersService,
    private toastr: ToastrService,
    private storageService: LocalStorageService,
    private translateService: TranslateService,
    @Inject(USERS_LOCAL_STORAGE_KEY) private localStorageKey,
    private router: Router,
  ) { }

  @Effect()
  onLoadUsers = this.actions$.pipe(
    ofType<LoadUsers>(UsersActionType.LoadUsers),
    switchMap(action => this.list(action.paging))
  );

  @Effect()
  onSearchUser = this.actions$.pipe(
    ofType<SearchUser>(UsersActionType.SearchUser),
    switchMap(action => this.search(action.email))
  );

  @Effect()
  onLoadUser = this.actions$.pipe(
    ofType<LoadUser>(UsersActionType.LoadUser),
    switchMap(action => this.usersService.load(action.id).pipe(
      map(s => new LoadUserSuccess(s)),
      catchError(() => of(new LoadUserFailed()))
    ))
  );

  @Effect()
  OnSetUserEmailStatus = this.actions$.pipe(
    ofType<SetUserEmailStatus>(UsersActionType.SetUserEmailStatus),
    switchMap(action => this.usersService.setUserEmailStatus(action.userid, action.emailStatus).pipe(
      map(_ => {
        this.toastr.success(this.translateService.instant('admin.users.details.updateUserSuccess'));
        return new SetUserEmailStatusSuccess(action.userid, action.emailStatus);
      }),
      catchError(() => {
        this.toastr.error(this.translateService.instant('admin.alerts.problemMsg'));
        return of(new LoadUserFailed());
      })
    ))
  );

  @Effect()
  onDeleteUser = this.actions$.pipe(
    ofType<DeleteUser>(UsersActionType.DeleteUser),
    switchMap(action => this.delete(action.id).pipe(
      map(s => {
        this.toastr.success(this.translateService.instant('admin.users.details.deleteUserSuccess'));
        this.router.navigateByUrl('/manager/users/list');
        return new DeleteUserSuccess();
      }),
      catchError(() => {
        this.toastr.error(this.translateService.instant('admin.alerts.problemMsg'));
        return of(new LoadUserFailed());
      }),
    ))
  );

  ngrxOnInitEffects(): UsersAction {
    const userFromLocalStorage = this.storageService.getSavedState(this.localStorageKey);
    const selectedUser = userFromLocalStorage ? userFromLocalStorage.selectedUser as SelectedUserState : null;
    return selectedUser && selectedUser.user.id > 0 ? new LoadUser(selectedUser.user.id) : new InitializeState();
  }

  private list(paging: Paging) {
    return this.usersService.list(paging).pipe(
      map(s => new LoadUsersSuccess(s)),
      catchError(a => of(new LoadUsersFailed(a.error.errors.map(err => err.message))))
    );
  }

  private search(email: string) {
    return this.usersService.search(email).pipe(
      map(s => new LoadUsersSuccess(s)),
      catchError(a => of(new LoadUsersFailed(a.error.errors.map(err => err.message))))
    );
  }

  private delete(id: number) {
    return this.usersService.delete(id).pipe(
      map(s => new LoadUsersSuccess(s)),
      catchError(a => of(new LoadUsersFailed(a.error.errors.map(err => err.message))))
    );
  }
}
