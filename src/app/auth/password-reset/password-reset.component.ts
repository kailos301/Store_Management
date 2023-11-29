import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthState, PasswordResetState } from '../+state/auth.reducer';
import { getPasswordReset } from '../+state/auth.selectors';
import { ResetPassword, ResetPasswordInitial } from '../+state/auth.actions';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CustomValidators } from 'src/app/shared/custom.validators';
@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {

  emailForm: FormGroup;
  state$: Observable<PasswordResetState>;

  constructor(private fb: FormBuilder, private store: Store<AuthState>, private router: Router,
              private translate: TranslateService) { }


  ngOnInit() {
    this.store.dispatch(new ResetPasswordInitial());
    this.state$ = this.store.select(getPasswordReset);

    this.emailForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, CustomValidators.email, Validators.maxLength(254)])]
    });
  }

  get email() {
    return this.emailForm.get('email');
  }

  onSubmit() {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
    } else {
      this.store.dispatch(new ResetPassword(this.email.value));
    }
  }
  onLocaleChange($event) {
    this.translate.use($event.locale);
  }
  goToLogin() {
    this.router.navigate(['/login']);
  }

}
