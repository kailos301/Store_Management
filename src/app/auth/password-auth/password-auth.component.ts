import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { AuthState } from '../+state/auth.reducer';
import { PasswordAuth, LogoutSuccess} from '../+state/auth.actions';
import { getInvalidCredentials, getUsername } from '../+state/auth.selectors';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-password-auth',
  templateUrl: './password-auth.component.html',
  styleUrls: ['./password-auth.component.scss']
})
export class PasswordAuthComponent implements OnInit, OnDestroy {
  loginForm: FormGroup = this.fb.group({});
  invalidCredentials$: Observable<boolean>;
  destroyed$ = new Subject<void>();

  constructor(
    private fb: FormBuilder, private store: Store<AuthState>, private router: Router, private toastr: ToastrService) { }

  ngOnInit() {
    this.store.pipe(select(getUsername),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      this.loginForm = this.fb.group({
        username: [s, Validators.required],
        password: ['',  Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(100)])]
      });

    });
    this.invalidCredentials$ = this.store.pipe(
      select(getInvalidCredentials)
    );
  }

  loginAction() {
    this.store.dispatch(new PasswordAuth(this.username.value, this.password.value));
    this.store.pipe(select(getInvalidCredentials),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      if (s) {
        this.toastr.error('Password Authentication failed, redirecting to Login page shortly');
        this.store.dispatch(new LogoutSuccess());
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }


}
