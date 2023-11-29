import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { FetchLoggedInUser } from '../auth/+state/auth.actions';

@Injectable({
  providedIn: 'root'
})
export class LoggedInUserGuard implements CanActivate {

  constructor(private store: Store<any>) { }

  canActivate() {
    this.store.dispatch(new FetchLoggedInUser());
    return true;
  }
}
