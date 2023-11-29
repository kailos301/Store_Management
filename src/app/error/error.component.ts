import { Component, OnInit, HostBinding } from '@angular/core';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

  @HostBinding('class.app') app = true;
  @HostBinding('class.flex-row') flex = true;
  @HostBinding('class.align-items-center') align = true;

  constructor() { }

  ngOnInit() { }
}
