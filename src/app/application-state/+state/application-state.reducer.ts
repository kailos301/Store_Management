import { combineReducers } from '@ngrx/store';
import { ApplicationStateAction, ApplicationStateActionType } from './application-state.actions';

export interface VersionState {
    oldVersion: string;
    newVersion: string;
    newVersionAvailable: boolean;
}

export interface ApplicationState {
    appVersion: VersionState;
}

export interface AppState {
    appState: ApplicationState;
}

export const appInitialState: ApplicationState = {
    appVersion: {
        oldVersion: '',
        newVersion: '',
        newVersionAvailable: false
    }
};

export function appVersion(appVersionState = appInitialState.appVersion, action: ApplicationStateAction): VersionState {

    switch (action.type) {
        case ApplicationStateActionType.NewServiceWorkerVersion:
            return {
                oldVersion: action.oldVersion,
                newVersion: action.newVersion,
                newVersionAvailable: action.oldVersion !== action.newVersion
            };
        default:
            return appVersionState;
    }
}

const reducer: (state: ApplicationState, action: ApplicationStateAction) => ApplicationState = combineReducers({
    appVersion
});

export function applicationStateReducer(state: ApplicationState = appInitialState, action: ApplicationStateAction): ApplicationState {
    return reducer(state, action);
}
