import { Action } from '@ngrx/store';
import { PageableResults, Paging } from 'src/app/api/types/Pageable';
import {
  ClientUser
} from '../users';

export enum UsersActionType {
  InitializeState = '[users] InitializeState',
  LoadUsers = '[users] LoadUsers',
  LoadUsersPage = '[users] LoadUsersPage',
  LoadUsersSuccess = '[users] LoadUsersSuccess',
  LoadUsersFailed = '[users] LoadUsersFailed',
  LoadUser = '[users] LoadUser',
  LoadUserSuccess = '[users] LoadUserSuccess',
  LoadUserFailed = '[users] LoadUserFailed',
  SearchUser = '[users] SearchUser',
  SetUserEmailStatus = '[users] SetUserEmailStatus',
  SetUserEmailStatusSuccess = '[users] SetUserEmailStatusSuccess',
  DeleteUser = '[users] DeleteUser',
  DeleteUserSuccess = '[users] DeleteUserSuccess',
}

export class InitializeState implements Action {
  readonly type = UsersActionType.InitializeState;

  constructor() { }
}

export class LoadUsers implements Action {
  readonly type = UsersActionType.LoadUsers;
  constructor(public readonly paging: Paging) { }
}

export class LoadUsersSuccess implements Action {
  readonly type = UsersActionType.LoadUsersSuccess;
  constructor(public readonly users: PageableResults<ClientUser>) { }
}

export class LoadUsersFailed implements Action {
  readonly type = UsersActionType.LoadUsersFailed;
  constructor(public readonly error: string) { }
}

export class LoadUser implements Action {
  readonly type = UsersActionType.LoadUser;

  constructor(public readonly id: number) { }

}

export class LoadUserSuccess implements Action {
  readonly type = UsersActionType.LoadUserSuccess;

  constructor(public readonly user: ClientUser) { }

}

export class LoadUserFailed implements Action {
  readonly type = UsersActionType.LoadUserFailed;

  constructor() { }

}

export class SearchUser implements Action {
  readonly type = UsersActionType.SearchUser;

  constructor(public readonly email: string) { }

}

export class SetUserEmailStatus implements Action {
  readonly type = UsersActionType.SetUserEmailStatus;

  constructor(public readonly userid: number, public readonly emailStatus: string) { }

}

export class SetUserEmailStatusSuccess implements Action {
  readonly type = UsersActionType.SetUserEmailStatusSuccess;

  constructor(public readonly userid: number, public readonly emailStatus: string) { }

}

export class DeleteUser implements Action {
  readonly type = UsersActionType.DeleteUser;

  constructor(public readonly id: number) { }

}

export class DeleteUserSuccess implements Action {
  readonly type = UsersActionType.DeleteUserSuccess;

  constructor() { }

}

export type UsersAction =
  InitializeState
  | LoadUsers
  | LoadUsersSuccess
  | LoadUsersFailed
  | LoadUser
  | LoadUserSuccess
  | LoadUserFailed
  | SearchUser
  | SetUserEmailStatus
  | SetUserEmailStatusSuccess
  | DeleteUser
  | DeleteUserSuccess;
