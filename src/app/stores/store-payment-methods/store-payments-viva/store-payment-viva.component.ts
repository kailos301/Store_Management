import { getSelectedStore } from '../../+state/stores.selectors';
import { UpdateStoreSettings } from '../../+state/stores.actions';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { StoresState } from '../../+state/stores.reducer';
import { Store, select } from '@ngrx/store';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
    selector: 'app-store-payment-viva',
    templateUrl: './store-payment-viva.component.html',
    styleUrls: ['./store-payment-viva.component.scss']
})
export class StorePaymentVivaComponent implements OnInit, OnDestroy {

    private destroy$ = new Subject();
    vivaForm: FormGroup;
    vivaEnabled: boolean;

    constructor(private store: Store<StoresState>, private fb: FormBuilder) { }

    ngOnInit(): void {

        this.vivaForm = this.fb.group({
            VIVA_CLIENT_ID: ['', Validators.compose([Validators.maxLength(100)])],
            VIVA_CLIENT_SECRET: ['', Validators.compose([Validators.maxLength(100)])]
        }, { validator: this.requiredFieldsValidator() });

        this.store.pipe(
            select(getSelectedStore),
            filter(s => s && s.id !== -1),
            takeUntil(this.destroy$)
        ).subscribe(s => {
            this.vivaForm.patchValue(s.settings, {emitEvent: false});
            this.vivaEnabled = s.settings.PAYMENT_VIVA_CREDIT_CARD_ENABLED;
        });

        this.vivaForm.valueChanges.subscribe(v => {
            if (!v.VIVA_CLIENT_ID.trim() &&
                !v.VIVA_CLIENT_SECRET.trim()
                ) {
                this.vivaEnabled = false;
                this.toggleVivaPayments(false);
            }

        });

    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getControl(name: string) {
        return this.vivaForm.get(name);
    }

    toggleVivaPayments(e) {
        // Do not enable square payments if no access token and application id defined
        if (this.vivaForm.controls.VIVA_CLIENT_ID.value.trim().length === 0
            && this.vivaForm.controls.VIVA_CLIENT_SECRET.value.trim().length === 0
            && e) {
            setTimeout(() => {
                this.vivaEnabled = false;
            });
            return;
        }
        if (this.vivaForm.valid) {
            const formData = this.vivaForm.getRawValue();
            this.store.dispatch(new UpdateStoreSettings({PAYMENT_VIVA_CREDIT_CARD_ENABLED: e, ...formData}));
        } else {
            setTimeout(() => {
                this.vivaEnabled = false;
            });

        }
    }

    updateSettings() {
        if (this.vivaForm.valid) {
            const formData = this.vivaForm.getRawValue();
            this.store.dispatch(new UpdateStoreSettings(formData));
        }
    }

    requiredFieldsValidator(): ValidatorFn {

        return (control: AbstractControl): {[key: string]: any} | null => {
            const clientId = control.get('VIVA_CLIENT_ID').value.trim();
            const clientSecret = control.get('VIVA_CLIENT_SECRET').value.trim();

            control.get('VIVA_CLIENT_ID').setErrors( {required: null} );
            control.get('VIVA_CLIENT_ID').updateValueAndValidity({emitEvent: false, onlySelf: true});
            control.get('VIVA_CLIENT_SECRET').setErrors( {required: null} );
            control.get('VIVA_CLIENT_SECRET').updateValueAndValidity({emitEvent: false, onlySelf: true});

            if (!!clientId || !!clientSecret) {
                if (!clientId) {
                    control.get('VIVA_CLIENT_ID').setErrors( {required: true} );
                }
                if (!clientSecret) {
                    control.get('VIVA_CLIENT_SECRET').setErrors( {required: true} );
                }
            }

            return null;

        };

    }

}
