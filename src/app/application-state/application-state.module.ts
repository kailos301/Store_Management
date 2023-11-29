import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { appInitialState, applicationStateReducer } from './+state/application-state.reducer';
import { AppStateReloaderComponent } from './app-state-reloader/app-state-reloader.component';

@NgModule({
  declarations: [AppStateReloaderComponent],
  exports: [AppStateReloaderComponent],
  imports: [
    CommonModule,
    StoreModule.forFeature('appState', applicationStateReducer, { initialState: appInitialState }),
  ]
})
export class ApplicationStateModule { }
