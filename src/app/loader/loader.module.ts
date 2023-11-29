import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader.component';
import { SharedModule } from '../shared/shared.module';
import { StoreModule } from '@ngrx/store';
import { loaderReducer, loaderInitialState } from './+state/loader.reducer';
import { EffectsModule } from '@ngrx/effects';
import { LoaderEffects } from './+state/loader.effects';


@NgModule({
  declarations: [LoaderComponent],
  exports: [LoaderComponent],
  imports: [
    CommonModule,
    SharedModule,
    StoreModule.forFeature('loader', loaderReducer, { initialState: loaderInitialState}),
    EffectsModule.forFeature([LoaderEffects]),
  ]
})
export class LoaderModule { }
