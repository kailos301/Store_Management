import { CreatePassword } from './../+state/account.actions';
import { CustomValidators } from 'src/app/shared/custom.validators';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountState } from '../+state/account.reducer';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { getCreatePasswordStatus, getCreatePasswordErrors } from '../+state/account.selectors';

@Component({
  selector: 'app-password-create',
  templateUrl: './password-create.component.html',
  styleUrls: ['./password-create.component.scss']
})
export class PasswordCreateComponent implements OnInit {

  passwordCreateForm: FormGroup;
  status$: Observable<string>;
  errors$: Observable<string[]>;

  constructor(private fb: FormBuilder, private store: Store<AccountState>) { }

  ngOnInit() {

    this.passwordCreateForm = this.fb.group({
      newPassword: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(100)])],
      confirmPassword: ['', Validators.compose([Validators.required, Validators.maxLength(100)])]
    }, { validator: CustomValidators.matchFieldsValidator('confirmPassword', 'newPassword')});

    this.status$ = this.store.pipe(
      select(getCreatePasswordStatus)
    );

    this.errors$ = this.store.pipe(
      select(getCreatePasswordErrors)
    );
  }

  get newPassword() {
    return this.passwordCreateForm.get('newPassword');
  }

  get confirmPassword() {
    return this.passwordCreateForm.get('confirmPassword');
  }

  create() {
    this.store.dispatch(new CreatePassword(this.newPassword.value));
  }

}
