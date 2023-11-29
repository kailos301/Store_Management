import { ChangePassword } from './../+state/account.actions';
import { CustomValidators } from 'src/app/shared/custom.validators';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountState } from '../+state/account.reducer';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { getChangePasswordStatus, getChangePasswordErrors } from '../+state/account.selectors';

@Component({
  selector: 'app-password-change',
  templateUrl: './password-change.component.html',
  styleUrls: ['./password-change.component.scss']
})
export class PasswordChangeComponent implements OnInit {

  passwordUpdateForm: FormGroup;
  status$: Observable<string>;
  errors$: Observable<string[]>;

  constructor(private fb: FormBuilder, private store: Store<AccountState>) { }

  ngOnInit() {

    this.passwordUpdateForm = this.fb.group({
      password: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(100)]) ],
      newPassword: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(100)])],
      confirmPassword: ['', Validators.compose([Validators.required, Validators.maxLength(100)])]
    }, { validator: CustomValidators.matchFieldsValidator('confirmPassword', 'newPassword')});

    this.status$ = this.store.pipe(
      select(getChangePasswordStatus)
    );

    this.errors$ = this.store.pipe(
      select(getChangePasswordErrors)
    );
  }

  get password() {
    return this.passwordUpdateForm.get('password');
  }

  get newPassword() {
    return this.passwordUpdateForm.get('newPassword');
  }

  get confirmPassword() {
    return this.passwordUpdateForm.get('confirmPassword');
  }

  change() {
    this.store.dispatch(new ChangePassword(this.password.value, this.newPassword.value));
  }

}
