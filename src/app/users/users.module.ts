import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { UsersRoutingModule } from './users-routing.module';
import { UserViewComponent } from './user-view/user-view.component';
import { UsersListComponent } from './users-list/users-list.component';

import { UsersEffects } from './+state/users.effects';
import { usersReducer } from './+state/users.reducer';
import { USERS_LOCAL_STORAGE_KEY, USERS_CONFIG_TOKEN } from './users.tokens';

import { SharedModule } from '../shared/shared.module';
import { LocalStorageService } from '../local-storage.service';
import { storageMetaReducer } from '../storage.metareducer';


export function getUsersConfig(
  localStorageKey: string,
  storageService: LocalStorageService
) {
  return {
    metaReducers: [
      storageMetaReducer(
        ({ selectedUser, storesUserExperience }) => ({ selectedUser, storesUserExperience }), localStorageKey, storageService
      )
    ]
  };
}

@NgModule({
  declarations: [UserViewComponent, UsersListComponent],
  imports: [
    CommonModule,
    FormsModule,
    UsersRoutingModule,
    EffectsModule.forFeature([UsersEffects]),
    StoreModule.forFeature('allusers', usersReducer, USERS_CONFIG_TOKEN),
    SharedModule,
    SharedModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  providers: [
    { provide: USERS_LOCAL_STORAGE_KEY, useValue: '__users_storage__' },
    {
      provide: USERS_CONFIG_TOKEN,
      deps: [USERS_LOCAL_STORAGE_KEY, LocalStorageService],
      useFactory: getUsersConfig
    }
  ],
  exports: [UsersListComponent],
})
export class UsersModule { }
