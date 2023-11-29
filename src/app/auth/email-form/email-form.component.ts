import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { CustomValidators } from 'src/app/shared/custom.validators';
@Component({
  selector: 'app-email-form',
  templateUrl: './email-form.component.html',
  styleUrls: ['./email-form.component.scss']
})

export class EmailFormComponent implements OnInit {

  emailForm: FormGroup;
  @Output() submitEvent = new EventEmitter<string>();

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.emailForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, CustomValidators.email, Validators.maxLength(254)])]
    });
  }

  get email() {
    return this.emailForm.get('email');
  }

  onSubmit() {
    this.submitEvent.emit(this.email.value);
  }

}
