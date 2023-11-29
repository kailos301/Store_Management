import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { Location } from '@angular/common';
import { select, Store } from '@ngrx/store';
import { getSelectedStore } from 'src/app/stores/+state/stores.selectors';
import { filter, takeUntil } from 'rxjs/operators';
import { DeleteStore } from '../+state/stores.actions';
import { StoresState } from '../+state/stores.reducer';
@Component({
  selector: 'app-store-delete',
  templateUrl: './store-delete.component.html',
  styleUrls: ['./store-delete.component.scss']
})
export class StoreDeleteComponent implements OnInit, OnDestroy {
  storeId: number;
  unsubscribe$: Subject<void> = new Subject<void>();
  constructor(public dialogRef: MatDialogRef<StoreDeleteComponent>, private store: Store<StoresState>, private location: Location) { }

  ngOnInit() {
    this.store.pipe(
      takeUntil(this.unsubscribe$),
      select(getSelectedStore),
      filter(l => l.id > 0),
      takeUntil(this.unsubscribe$)
    ).subscribe(s => {
        this.storeId = s.id;
    });
  }
  onNoClick(): void {
    this.location.back();
    this.dialogRef.close();
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  deleteStore() {
    this.store.dispatch(new DeleteStore(this.storeId));
    this.dialogRef.close();
  }
}
