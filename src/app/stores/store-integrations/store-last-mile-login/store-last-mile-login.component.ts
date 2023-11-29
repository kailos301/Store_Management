import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MynextLogin } from '../../+state/stores.actions';
import { getMynextLogin } from '../../+state/stores.selectors';
import { UpdateStoreSettings } from '../../+state/stores.actions';

@Component({
  selector: 'app-store-last-mile-login',
  templateUrl: './store-last-mile-login.component.html',
  styleUrls: ['./store-last-mile-login.component.scss']
})
export class StoreLastMileLoginComponent implements OnInit {

  mynextCredentialsForm: FormGroup;
  invalidCredentials: boolean;
  destroyed$ = new Subject<void>();

  constructor(private fb: FormBuilder, private store: Store<any>) { }

  ngOnInit() {
    this.invalidCredentials = false;
    this.mynextCredentialsForm = this.fb.group({
      username: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      password: ['', Validators.compose([Validators.required, Validators.maxLength(100)])]
    });

    this.store.pipe(select(getMynextLogin), takeUntil(this.destroyed$))
      .subscribe(response => {
        if (response) {
          if (response.invalidCredentials) {
            this.invalidCredentials = response.invalidCredentials;
          } else if (response.apiKey && response.myNextId) {
            const myNextSettings = {
              DELIVERY_PROVIDER_MYNEXT_ACCOUNT_ID: response.myNextId,
              DELIVERY_PROVIDER_MYNEXT_API_KEY: response.apiKey,
              DELIVERY_PROVIDER_MYNEXT_ENABLE: true,
            };
            this.store.dispatch(new UpdateStoreSettings(myNextSettings));
          }
        }
      });
  }

  /**
   * @method onSubmit to submit the mynext login form data
   * @returns void
   */

  onSubmit(): void {
    if (this.mynextCredentialsForm.valid) {
      this.invalidCredentials = false;
      const loginData = this.mynextCredentialsForm.getRawValue();
      this.store.dispatch(new MynextLogin(loginData.username, loginData.password));
    }
  }

}
