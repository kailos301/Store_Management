import { Component, OnInit, HostBinding } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error500',
  templateUrl: './error500.component.html',
  styleUrls: ['./error500.component.scss']
})
export class Error500Component implements OnInit {

  @HostBinding('class.app') app = true;
  @HostBinding('class.flex-row') flex = true;
  @HostBinding('class.align-items-center') align = true;

  errorMessage: string;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.errorMessage = params.msg;
    });
  }

}
