import { Action } from '@ngrx/store';

export enum LoaderActionType {
  ShowLoader = '[loader] ShowLoader',
  HideLoader = '[loader] HideLoader'
}

export class ShowLoader implements Action {
  readonly type = LoaderActionType.ShowLoader;

  constructor(public payload: any) {}
}

export class HideLoader implements Action {
  readonly type = LoaderActionType.HideLoader;

  constructor(public payload: any) {}
}

export type LoaderAction = ShowLoader | HideLoader;
