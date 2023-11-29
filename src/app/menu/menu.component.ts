import { TranslatableNavItem } from './+state/menu.reducer';
import { Subject, combineLatest, Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { getLoggedInUser } from './../auth/+state/auth.selectors';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { getNavItems } from './+state/menu.selectors';
import { WindowRefService } from '../window.service';
import { TranslateService } from '@ngx-translate/core';
import { getSelectedStore } from '../stores/+state/stores.selectors';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
  navItems: TranslatableNavItem[];
  public sidebarMinimized = false;
  private destroy$ = new Subject();
  constructor(private store: Store<any>, private windowService: WindowRefService, private translateService: TranslateService) { }

  ngOnInit() {
    combineLatest([
        this.store.pipe(select(getLoggedInUser)),
        this.store.pipe(select(getNavItems)),
        this.store.pipe(select(getSelectedStore))
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([loggedInUser, items, selectedStore]) => {
        this.navItems = items.map(x => Object.assign({}, x));
        this.navItems.forEach((item) => {

          if (item.storeRoles && !loggedInUser.superAdmin) {
            if (
              loggedInUser.storeRoles &&
              loggedInUser.storeRoles[selectedStore.id] &&
              item.storeRoles.includes(loggedInUser.storeRoles[selectedStore.id])
            ) {
              item.attributes = {};
            } else {
              item.attributes = {
                hidden: true
              };
            }
          }

          if (item.key === 'admin.global.partnerProgram.label' && loggedInUser.affiliate) {
            item.attributes = {};
          }

          if (item.key === 'admin.store.list.storesList' && !loggedInUser.superAdmin && loggedInUser.numberOfStores <= 1) {
            item.attributes = {
              hidden: true
            };
          }

          if (item.key === 'admin.users.userManage.label' && loggedInUser.superAdmin) {
            item.attributes = {};
          }

          // if (item.key === 'admin.menu.preview') {
          //   item.url = (item.url as string)
          //     .replace('<protocol>', this.windowService.nativeWindowLocation.protocol)
          //     .replace('<domain>', this.windowService.nativeWindowLocation.host.replace('admin.', ''));
          // }
          if (item.key === 'admin.store.setting.billing') {
            if (
              selectedStore.subscription &&
              selectedStore.subscription.status &&
              (
                selectedStore.subscription.status === 'TRIAL' ||
                selectedStore.subscription.status === 'TRIAL_EXCEEDED'
              )
            ) {
              item.variant = 'warning';
              item.class = 'subscription-menu';
            } else {
              item.variant = '';
            }
          }
          if (item.key) {
            item.name = this.translateService.instant(item.key);
          }

        });

      });

    this.translateService.onLangChange.asObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(e => {
        this.navItems = this.navItems.map(x => Object.assign({}, x));
        this.navItems.forEach((item) => {
          if (item.key) {
            item.name = this.translateService.instant(item.key);
          }
          return item;
        });
      });

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }

}
