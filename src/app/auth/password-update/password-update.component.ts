import { CustomValidators } from 'src/app/shared/custom.validators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { AuthState, PasswordUpdateState } from '../+state/auth.reducer';
import { getPasswordUpdate } from '../+state/auth.selectors';
import { Observable } from 'rxjs';
import { UpdatePassword } from '../+state/auth.actions';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-password-update',
  templateUrl: './password-update.component.html',
  styleUrls: ['./password-update.component.scss']
})
export class PasswordUpdateComponent implements OnInit {

  passwordUpdateForm: FormGroup;
  state$: Observable<PasswordUpdateState>;

  constructor(private fb: FormBuilder, private store: Store<AuthState>, private translate: TranslateService) { }

  ngOnInit() {
    this.passwordUpdateForm = this.fb.group({
      password: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(100)])],
      confirmPassword: ['', Validators.compose([Validators.required, Validators.maxLength(100)])]
    }, { validator: CustomValidators.matchFieldsValidator('confirmPassword', 'password') });

    this.state$ = this.store.pipe(
      select(getPasswordUpdate)
    );
  }
  update() {
    this.store.dispatch(new UpdatePassword(this.password.value));
  }
  onLocaleChange(e) {
    this.translate.use(e.locale);
  }

  get password() {
    return this.passwordUpdateForm.get('password');
  }

  get confirmPassword() {
    return this.passwordUpdateForm.get('confirmPassword');
  }

}
