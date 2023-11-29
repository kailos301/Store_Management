import { Observable } from 'rxjs';
import {
  Component,
  OnInit,
  Inject,
  ElementRef,
  ViewChild,
  SimpleChanges,
  OnChanges,
  OnDestroy,
  HostListener
} from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Paging } from 'src/app/api/types/Pageable';

import {Subscription} from 'rxjs/index';
import {UserState} from '../+state/user.reducer';
import { getCommissionsList } from '../+state/user.selectors';
import { LoadCommissionsPage } from '../+state/user.actions';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-store-commissions',
  templateUrl: './commissions.component.html',
  styleUrls: ['./commissions.component.scss']
})
export class CommissionsComponent implements OnInit, OnDestroy {

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  public innerWidth: any;

  subscription: Subscription;
  commissions$: Observable<any>;

  constructor(
    private store: Store<UserState>, private translate: TranslateService
  ) { }

  ngOnInit() {
    this.commissions$ = this.store.pipe(select(getCommissionsList));
    this.innerWidth = window.innerWidth;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  paginate(paging: Paging) {
    this.store.dispatch(new LoadCommissionsPage(paging));
  }

  getCommissionStatus(commissionStatus: string) {
    return this.translate.instant('admin.store.voucher.' + commissionStatus.toLowerCase());
  }
}
