import {Component, OnDestroy, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {getProfile} from '../../account/+state/account.selectors';
import {Observable, Subscription} from 'rxjs/index';
import {UserProfile} from '../../api/types/User';
import {User} from '../../stores/stores';
import {AddUserAffiliate} from '../+state/user.actions';
import { helpPage } from 'src/app/shared/help-page.const';

@Component({
  selector: 'app-store-user-become-affiliate',
  templateUrl: './become-affiliate.component.html',
  styleUrls: ['./become-affiliate.component.scss']
})
export class BecomeAffiliateComponent implements OnInit {

  userId: number;
  isChecked = false;
  profile$: Observable<UserProfile>;
  subscription: Subscription;
  partnerProgramHelpPage = helpPage.partner;
  constructor(
    private store: Store<User>
  ) { }

  ngOnInit() {

    this.profile$ = this.store.pipe(
      select(getProfile)
    );
  }

  createAffiliate() {
    this.store.dispatch(new AddUserAffiliate());
  }
}
