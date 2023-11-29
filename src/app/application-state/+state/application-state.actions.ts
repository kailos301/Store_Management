import { Action } from '@ngrx/store';

export enum ApplicationStateActionType {
    NewServiceWorkerVersion = '[appState] NewServiceWorkerVersion',
}

export class NewServiceWorkerVersion implements Action {
    readonly type = ApplicationStateActionType.NewServiceWorkerVersion;

    constructor(public readonly oldVersion: string, public readonly newVersion: string) { }
}

export type ApplicationStateAction = NewServiceWorkerVersion;
