import { Schedule, SpecialSchedule } from '../stores-schedule';
import { StoresAction, StoreScheduleActionType } from './stores-schedule.actions';
import { combineReducers } from '@ngrx/store';


export interface ScheduleList {
  status: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';
  data: Schedule[];
}

export interface SelectedScheduleItem {
  status: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';
  data: Schedule;
}

export interface SpecialScheduleList {
  status: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';
  data: SpecialSchedule[];
}

export interface Schedules {
  schedulelist: ScheduleList;
  selectedSchedule: SelectedScheduleItem;
  openingSchedule: SpecialScheduleList;
  addressDeliverySchedule: SpecialScheduleList;
  pickupSchedule: SpecialScheduleList;
  servingSchedule: SpecialScheduleList;
}

export interface SchedulesState {
  schedules: Schedules;
}

export const scheduleInitialState: Schedules = {
  schedulelist: {
    status: 'INITIAL',
    data: []
  },
  selectedSchedule: {
    status: 'INITIAL',
    data: {
      id: -1,
      name: '',
      availabilities: []
    }
  },
  openingSchedule: {
    status: 'INITIAL',
    data: []
  },
  addressDeliverySchedule: {
    status: 'INITIAL',
    data: []
  },
  pickupSchedule: {
    status: 'INITIAL',
    data: []
  },
  servingSchedule: {
    status: 'INITIAL',
    data: []
  }
};


export function schedulelist(state: ScheduleList = scheduleInitialState.schedulelist, action: StoresAction): ScheduleList {
  switch (action.type) {
    case StoreScheduleActionType.LoadSchedules:
      return { ...state, status: 'LOADING' };
    case StoreScheduleActionType.LoadSchedulesSuccess:
      return {
        status: 'LOADED',
        data: action.schedules
      };
    case StoreScheduleActionType.LoadSchedulesFailed:
      return { ...scheduleInitialState.schedulelist, status: 'FAILED' };
    default:
      return state;
  }
}

export function selectedSchedule(
  state: SelectedScheduleItem = scheduleInitialState.selectedSchedule,
  action: StoresAction,
): SelectedScheduleItem {
  switch (action.type) {
    case StoreScheduleActionType.LoadSchedule:
      return { ...state, status: 'LOADING' };
    case StoreScheduleActionType.LoadScheduleSuccess:
      return {
        status: 'LOADED',
        data: action.schedule
      };
    case StoreScheduleActionType.LoadScheduleFailed:
      return { ...scheduleInitialState.selectedSchedule, status: 'FAILED' };
    default:
      return state;
  }
}

export function openingSchedule(
  state: SpecialScheduleList = scheduleInitialState.openingSchedule,
  action: StoresAction,
): SpecialScheduleList {
  switch (action.type) {
    case StoreScheduleActionType.LoadOpeningSchedule:
      return { ...state, status: 'LOADING' };
    case StoreScheduleActionType.LoadOpeningScheduleSuccess:
      return {
        status: 'LOADED',
        data: action.openingSchedule
      };
    case StoreScheduleActionType.CreateOpeningScheduleSuccess:
      return {
        status: 'LOADED',
        data: [action.openingSchedule]
      };
    case StoreScheduleActionType.LoadSpecialScheduleFailed:
      return { ...scheduleInitialState.openingSchedule, status: 'FAILED' };
    case StoreScheduleActionType.DeleteOpeningScheduleSuccess:
      return {
        status: 'LOADED',
        data: []
      };
    default:
      return state;
  }
}

export function addressDeliverySchedule(
  state: SpecialScheduleList = scheduleInitialState.addressDeliverySchedule,
  action: StoresAction,
): SpecialScheduleList {
  switch (action.type) {
    case StoreScheduleActionType.LoadAddressDeliverySchedule:
      return { ...state, status: 'LOADING' };
    case StoreScheduleActionType.LoadAddressDeliveryScheduleSuccess:
      return {
        status: 'LOADED',
        data: action.addressDeliverySchedule
      };
    case StoreScheduleActionType.CreateAddressDeliveryScheduleSuccess:
      return {
        status: 'LOADED',
        data: [action.addressDeliverySchedule]
      };
    case StoreScheduleActionType.LoadSpecialScheduleFailed:
      return { ...scheduleInitialState.addressDeliverySchedule, status: 'FAILED' };
    case StoreScheduleActionType.DeleteAddressDeliveryScheduleSuccess:
      return {
        status: 'LOADED',
        data: []
      };
    default:
      return state;
  }
}

export function pickupSchedule(
  state: SpecialScheduleList = scheduleInitialState.pickupSchedule,
  action: StoresAction,
): SpecialScheduleList {
  switch (action.type) {
    case StoreScheduleActionType.LoadPickupSchedule:
      return { ...state, status: 'LOADING' };
    case StoreScheduleActionType.LoadPickupScheduleSuccess:
      return {
        status: 'LOADED',
        data: action.pickupSchedule
      };
    case StoreScheduleActionType.CreatePickupScheduleSuccess:
      return {
        status: 'LOADED',
        data: [action.pickupSchedule]
      };
    case StoreScheduleActionType.LoadSpecialScheduleFailed:
      return { ...scheduleInitialState.pickupSchedule, status: 'FAILED' };
    case StoreScheduleActionType.DeletePickupScheduleSuccess:
      return {
        status: 'LOADED',
        data: []
      };
    default:
      return state;
  }
}

export function servingSchedule(
  state: SpecialScheduleList = scheduleInitialState.servingSchedule,
  action: StoresAction,
): SpecialScheduleList {
  switch (action.type) {
    case StoreScheduleActionType.LoadServingSchedule:
      return { ...state, status: 'LOADING' };
    case StoreScheduleActionType.LoadServingScheduleSuccess:
      return {
        status: 'LOADED',
        data: action.servingSchedule
      };
    case StoreScheduleActionType.CreateServingScheduleSuccess:
      return {
        status: 'LOADED',
        data: [action.servingSchedule]
      };
    case StoreScheduleActionType.LoadSpecialScheduleFailed:
      return { ...scheduleInitialState.servingSchedule, status: 'FAILED' };
    case StoreScheduleActionType.DeleteServingScheduleSuccess:
      return {
        status: 'LOADED',
        data: []
      };
    default:
      return state;
  }
}


const reducerSchedule: (state: Schedules, action: StoresAction) => Schedules = combineReducers({
  schedulelist,
  selectedSchedule,
  openingSchedule,
  addressDeliverySchedule,
  pickupSchedule,
  servingSchedule
});

export function storesScheduleReducer(state: Schedules = scheduleInitialState, action: StoresAction): Schedules {
  return reducerSchedule(state, action);
}
