import { Component, OnInit, Inject, Renderer2 } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';
import { getSelectedStore, getStoresList } from 'src/app/stores/+state/stores.selectors';
import { Logout } from 'src/app/auth/+state/auth.actions';
import { ClientStore } from 'src/app/stores/stores';
import { StoresList } from 'src/app/stores/+state/stores.reducer';
import { map } from 'rxjs/operators';
import { LoggedInUser } from 'src/app/auth/auth';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { isNewVersionAvailable } from 'src/app/application-state/+state/application-state.selectors';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {

  username$: Observable<string>;
  store$: Observable<ClientStore>;
  storeList$: Observable<StoresList>;
  changeBtnVisible$: Observable<boolean>;
  hasPassword$: Observable<boolean>;
  isNewVersionAvailable$: Observable<boolean>;
  isPos = false;

  constructor(  private store: Store<any>
              , private renderer: Renderer2
              , @Inject(DOCUMENT) private document: any
              , private router: Router
              ) { }

  ngOnInit() {
    this.document.documentElement.lang = 'en';
    this.isPos = this.router.url.includes('/capture/');
    this.router.events.subscribe(_ => {
      this.isPos = this.router.url.includes('/capture/');
    });

    const loggedInUser$: Observable<LoggedInUser>  = this.store.pipe(
      select(getLoggedInUser)
    );

    this.username$ = loggedInUser$.pipe(
      map(u => u.username)
    );

    this.changeBtnVisible$ = loggedInUser$.pipe(
      map(u => u.superAdmin || u.numberOfStores > 1)
    );

    this.hasPassword$ = loggedInUser$.pipe(
      map(u => u.authenticationMethod === 'PASSWORD')
    );

    this.store$ = this.store.pipe(
      select(getSelectedStore)
    );
    this.storeList$ = this.store.pipe(
      select(getStoresList)
    );

    this.document.title = 'GonnaOrder';

    this.isNewVersionAvailable$ = this.store.pipe(select(isNewVersionAvailable));
  }

  logout() {
    this.store.dispatch(new Logout());
  }

  isNotAdmin() {
    return false;
  }

  closeMobileMenu(event) {
    event.preventDefault();
    this.renderer.removeClass(this.document.body, 'sidebar-show');
  }

}
