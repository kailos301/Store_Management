import { Injectable } from '@angular/core';

@Injectable( { providedIn: 'root' } )
export class LocalStorageService {
  constructor() {}

  setSavedState(state: any, localStorageKey: string) {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(state));
    } catch (e) {
      console.log('localstorage disabled');
    }
  }

  removeSavedState(localStorageKey: string) {
    try {
      localStorage.removeItem(localStorageKey);
    } catch (e) {
      console.log('localstorage disabled');
    }
  }

  getSavedState(localStorageKey: string): any {
    try {
      return JSON.parse(localStorage.getItem(localStorageKey));
    } catch (e) {
      console.log('localstorage disabled');
      return null;
    }
  }
}
