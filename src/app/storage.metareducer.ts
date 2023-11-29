import { Action, ActionReducer } from '@ngrx/store';
import { LocalStorageService } from './local-storage.service';

export function storageMetaReducer<S, A extends Action = Action>(
    saveKeys: any,
    localStorageKey: string,
    storageService: LocalStorageService
   ) {

    let onInit = true; // after load/refresh…
    return (reducer: ActionReducer<S, A>) => {
        return (state: S, action: A): S => {
            // get the next state.
            const nextState = reducer(state, action);
            // init the application state.
            if (onInit) {
                onInit = false;
                const savedState = storageService.getSavedState(localStorageKey);
                return {...nextState, ...savedState};
            }
            // save the next state to the application storage.
            // console.log('in metareducer, next state... ', nextState, 'saveKeys', saveKeys);
            const stateToSave = saveKeys(nextState);
            storageService.setSavedState(stateToSave, localStorageKey);

            return nextState;
        };
    };
}
