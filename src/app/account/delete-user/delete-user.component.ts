import { Component, OnInit } from '@angular/core';
import { DeleteUserPopupComponent } from '../delete-user-popup/delete-user-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-delete-user',
  templateUrl: './delete-user.component.html',
  styleUrls: ['./delete-user.component.scss']
})
export class DeleteUserComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.deleteUser();
  }

  deleteUser() {

    const dialogRef = this.dialog.open(DeleteUserPopupComponent, {
      width: '40%',
      data: {mode: 'DELETE', message: this.translate.instant('admin.store.account.confirmDeleteUser')}
    });
  }

}
