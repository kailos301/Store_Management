import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthState, AccountVerificationStatus } from '../+state/auth.reducer';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { getAccountVerificationStatus } from '../+state/auth.selectors';
import { VerifyAccount } from '../+state/auth.actions';

@Component({
  selector: 'app-account-verification',
  templateUrl: './account-verification.component.html',
  styleUrls: ['./account-verification.component.scss']
})
export class AccountVerificationComponent implements OnInit {
  status$: Observable<AccountVerificationStatus>;

  constructor(private store: Store<AuthState>
  ) { }

  ngOnInit() {
    this.status$ = this.store.select(getAccountVerificationStatus);
  }
  verify(email: string) {
    this.store.dispatch(new VerifyAccount(email));
  }
}
