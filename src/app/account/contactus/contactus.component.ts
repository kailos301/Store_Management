import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SendEmail } from '../+state/account.actions';

@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.scss']
})
export class ContactusComponent implements OnInit {
  contactForm: FormGroup;

  constructor(private store: Store<any>, private fb: FormBuilder) { }

  ngOnInit() {
    this.contactForm = this.fb.group({
      description: ['', Validators.compose([Validators.required, Validators.minLength(10)])]
    });
  }

  onSubmit() {
    this.store.dispatch(new SendEmail(this.getControl('description').value));
  }

  getControl(name: string) {
    return this.contactForm.get(name);
  }
}
