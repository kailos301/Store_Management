import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { StoreDeleteComponent } from '../store-delete/store-delete.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-store-deletepopup',
  templateUrl: './store-delete-popup.component.html',
  styleUrls: ['./store-delete-popup.component.scss']
})
export class StoreDeletePopupComponent implements OnInit {

  constructor(public dialog: MatDialog,  private translate: TranslateService) { }

  ngOnInit() {
    this.deleteStore();
  }

  deleteStore() {

    const dialogRef = this.dialog.open(StoreDeleteComponent, {
      width: '40%',
    });
  }
}
