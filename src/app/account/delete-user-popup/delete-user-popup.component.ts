import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AccountState } from '../+state/account.reducer';
import { Subject } from 'rxjs';
import { getProfile } from '../+state/account.selectors';
import { takeUntil } from 'rxjs/operators';
import { DeleteUser } from '../+state/account.actions';
import {Location} from '@angular/common';

@Component({
  selector: 'app-delete-popup',
  templateUrl: './delete-user-popup.component.html',
  styleUrls: ['./delete-user-popup.component.scss']
})
export class DeleteUserPopupComponent implements OnInit, OnDestroy {
  userId: any;
  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<DeleteUserPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private store: Store<AccountState>, private location: Location) { }

  ngOnInit() {
    this.store.select(getProfile)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(s => {
        this.userId = s.id;
      });
  }
  onNoClick(): void {
    this.location.back();
    this.dialogRef.close();
  }

  deleteUser(): void {
    this.store.dispatch(new DeleteUser(this.userId));
    this.dialogRef.close();
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
