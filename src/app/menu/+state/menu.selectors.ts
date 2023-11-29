import { Menu } from './menu.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const getMenuState = createFeatureSelector<Menu>('menu');
export const getNavItems = createSelector(getMenuState, (state: Menu) => state.navItems);
