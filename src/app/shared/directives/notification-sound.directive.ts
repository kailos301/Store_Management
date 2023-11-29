import { StoresActionType } from '../../stores/+state/stores.actions';
import { Directive, OnInit, OnDestroy } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';


export interface NotificationAction {
  type: string;
  audioSrc: string;
}

@Directive({
  selector: '[appNotificationSound]'
})
export class NotificationSoundDirective implements OnInit, OnDestroy {
  subscription: Subscription;
  audio: HTMLAudioElement;

  constructor(private actions$: Actions) { }

  ngOnInit() {
    this.subscription = this.actions$.pipe(
      ofType<NotificationAction>(StoresActionType.StartOrderNotificationSound)
    ).subscribe((action) => {
      this.audio = new Audio(action.audioSrc);
      const play = this.audio.play();
      if (!!play) {
        play.catch(err => {
          // TODO : Needs User Interaction with UI (like `click` action) for the first time
          //        to allow autoplay. Check `https://developers.google.com/web/updates/2017/09/autoplay-policy-changes`
          //        for more info. Possible workaround - mimic user interaction through script.
          console.error(err);
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
