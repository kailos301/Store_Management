import { LoaderActionType } from './loader.actions';

export interface Loader {
  active: number;
  actionsInProgress: any[];
}

export interface LoaderState {
  loading: Loader;
}

export const loaderInitialState: Loader = {
  active: 0,
  actionsInProgress: []
};

export function loading(state = loaderInitialState, action: any): Loader {
  switch (action.type) {
    case LoaderActionType.ShowLoader: {
      const isActionAlreadyInProgress = state.actionsInProgress.filter(
        (currentAction: any) => currentAction === action.payload.type
      ).length;

      // If the action in already in progress and is registered
      // we don't modify the state
      if (isActionAlreadyInProgress) {
        return state;
      }
      // Adding the action type in our actionsInProgress array
      const newActionsInProgress = [
        ...state.actionsInProgress,
        action.payload.type
      ];

      return {
        active: newActionsInProgress.length,
        actionsInProgress: newActionsInProgress
      };
    }
    case LoaderActionType.HideLoader: {
      // We remove trigger action from actionsInProgress array
      const newActionsInProgress = action.payload.triggerAction
        ? state.actionsInProgress.filter(
          (currentAction: any) =>
            currentAction !== action.payload.triggerAction
        )
        : state.actionsInProgress;

      return {
        actionsInProgress: newActionsInProgress,
        active: state.active > 0 ? newActionsInProgress.length : 0
      };
    }
    default:
      return state;
  }
}

export function loaderReducer(state: Loader = loaderInitialState, action: any): Loader {
  return loading(state, action);
}
