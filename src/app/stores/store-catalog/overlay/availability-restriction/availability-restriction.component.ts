import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-availability-restriction',
  templateUrl: './availability-restriction.component.html',
  styleUrls: ['./availability-restriction.component.scss']
})
export class AvailabilityRestrictionComponent implements OnInit {

  availabilityForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AvailabilityRestrictionComponent>, private fb: FormBuilder) { }

  ngOnInit() {
    const dt = new Date();
    dt.setHours(0, 0, 0, 0);
    this.availabilityForm = this.fb.group({
      startTime: [dt, Validators.compose([Validators.required])],
      endTime: [dt, Validators.compose([Validators.required])]
    });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  getAvailControl(name: string) {
    return this.availabilityForm.get(name);
  }
}
