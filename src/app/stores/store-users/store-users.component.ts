import { Observable, Subject } from 'rxjs';
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { UsersState } from '../+state/stores.reducer';
import { getUsersList } from '../+state/stores.selectors';
import { Paging } from 'src/app/api/types/Pageable';
import {
  LoadUsersPage,
  InviteUser,
  RemoveUserStoreAccess
} from '../+state/stores.actions';

import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { getSelectedStore } from 'src/app/stores/+state/stores.selectors';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { helpPage } from 'src/app/shared/help-page.const';
import { DeleteDialogData } from '../store-catalog/stores-catalog';
import { DeleteDialogComponent } from '../store-catalog/overlay/delete-dialog/delete-dialog.component';
import { TranslateService } from '@ngx-translate/core';

export interface DialogData {
  inviteeEmail: string;
  storeName: string;
  role: string;
}

@Component({
  selector: 'app-store-users',
  templateUrl: './store-users.component.html',
  styleUrls: ['./store-users.component.scss']
})
export class StoreUsersComponent implements OnInit, OnDestroy {
  users$: Observable<any>;
  storeId: number;
  regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  paramsSubscription: any;
  currentStore: string;
  destroyed$ = new Subject<void>();
  store$: Observable<any>;
  usersHelpPage = helpPage.users;

  constructor(
    private store: Store<UsersState>,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private authService: AuthService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.paramsSubscription = this.route.params
      .pipe(takeUntil(this.destroyed$))
      .subscribe(params => {
        this.storeId = params.id as number;
      });
    this.users$ = this.store.pipe(select(getUsersList));

    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      this.currentStore = s.name;
    });
  }

  paginate(paging: Paging) {
    this.store.dispatch(new LoadUsersPage(this.storeId, paging));
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(StoreInviteDialogComponent, {
      width: '450px',
      data: { storeName: this.currentStore + '', inviteeEmail: '', role: 'STORE_ADMIN' },
      panelClass: 'invite-user-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        if (this.validateInviteDialogSelection(result)) {
          this.invite(result);
        } else {
          this.toastr.error('Invalid Email Address', 'Invite failed!');
        }
      }
    });
  }

  private validateInviteDialogSelection(result: DialogData): boolean {
    return this.regexp.test(result.inviteeEmail.trim()) && !!result.role;
  }

  invite(result: DialogData) {
    this.store.dispatch(new InviteUser(result.inviteeEmail.trim(), result.role, this.storeId));
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  removeUserStoreAcess(userId: number) {
    const input: DeleteDialogData = { mode: null, message: null };
    input.mode = 'DELETE';
    input.message = this.translate.instant('admin.store.users.removeUser');
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '60%',
      data: input
    });
    dialogRef.afterClosed().subscribe(action => {
      if (action === 'DELETE') {
        this.store.dispatch(new RemoveUserStoreAccess(userId, this.storeId));
      }
    });
  }

}


@Component({
  selector: 'app-store-invite-dialog',
  templateUrl: 'store-invite-dialog.html'
})
export class StoreInviteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<StoreInviteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  save(): void {
    this.dialogRef.close(this.data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
