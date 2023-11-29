import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { UsersState } from '../+state/users.reducer';
import { getSelectedUser, getSelectedUserApiStatus } from '../+state/users.selectors';
import { SetUserEmailStatus, DeleteUser } from '../+state/users.actions';
import { DeleteDialogComponent } from '../../stores/store-catalog/overlay/delete-dialog/delete-dialog.component';
import { DeleteDialogData } from '../../stores/store-catalog/stores-catalog';
import { ClientUser } from '../users';
import { ClientStore } from 'src/app/stores/stores';
import { getSelectedStore } from 'src/app/stores/+state/stores.selectors';
import { DayType, Utils } from 'src/app/stores/utils/Utils';

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.scss']
})
export class UserViewComponent implements OnInit {

  user$: Observable<ClientUser>;
  user: ClientUser;
  emailStatus: string;
  store$: Observable<ClientStore>;
  storeLocaleTimeZone$: Observable<{locale: string; timezone: string; }>;
  constructor(
    private store: Store<UsersState>,
    private route: Router,
    private activeRoute: ActivatedRoute,
    public dialog: MatDialog,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.user$ = this.store.select(getSelectedUser);
    this.user$.subscribe(user => {
      this.emailStatus = user.emailVerified;
      this.user = user;
    });
    this.store.select(getSelectedUserApiStatus)
      .subscribe(status => {
        if (status === 'INITIAL' || status === 'FAILED') {
          this.route.navigateByUrl('/manager/users/list');
        }
      });
      // tslint:disable
      this.store$ = this.store.select(getSelectedStore);
      this.storeLocaleTimeZone$ = this.store.pipe(
        select(getSelectedStore),
        filter(s => s.id > 0),
        map(s => ({
          locale: s.address.country.defaultLocale + '-' + s.address.country.code,
          timezone: s.timeZone
        }))
      );
      // tslint:enable
  }

  updateEmailStatus() {
    this.store.dispatch(new SetUserEmailStatus(this.user.id, this.emailStatus));
  }

  deleteUser() {
    const input: DeleteDialogData = { mode: null, message: null };
    input.mode = 'DELETE';
    input.message = this.translate.instant('admin.users.details.confirmDeleteUser');
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '60%',
      data: input
    });
    dialogRef.afterClosed().subscribe(action => {
      if (action === 'DELETE') {
        this.store.dispatch(new DeleteUser(this.user.id));
      }
    });
  }
  dayCheck(inputDateStr: string) {
    return Utils.dayCheck(inputDateStr);
  }

  get DayType(): typeof DayType {
    return DayType;
  }
}
