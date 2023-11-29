import { QrCodesModule } from './../../qr-codes/qr-codes.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreLocationRoutingModule } from './store-location-routing.module';
import { StoreLocationComponent } from './store-location.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { storesLocationReducer, storesLocationInitialState } from './+state/store-location.reducer';
import { StoreLocationEffects } from './+state/store-location.effects';
import { StoreLocationFormComponent } from './store-location-form/store-location-form.component';
import { StoreLocationManageComponent } from './store-location-manage/store-location-manage.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@NgModule({
  declarations: [StoreLocationComponent, StoreLocationFormComponent, StoreLocationManageComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    QrCodesModule,
    StoreLocationRoutingModule,
    StoreModule.forFeature('storesLocation', storesLocationReducer, {initialState: storesLocationInitialState}),
    EffectsModule.forFeature([StoreLocationEffects]),
    MatDialogModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatButtonToggleModule,
    MatInputModule
  ],
})
export class StoreLocationModule { }
