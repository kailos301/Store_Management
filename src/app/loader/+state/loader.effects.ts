import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { filter, map } from 'rxjs/operators';
import { ShowLoader, HideLoader } from './loader.actions';

@Injectable()
export class LoaderEffects {
  constructor(private actions$: Actions) { }

  @Effect()
  showLoader$ = this.actions$.pipe(
    filter((action: any) => action && action.showLoader),
    map((action: any) => new ShowLoader(action))
  );

  @Effect()
  hideLoader$ = this.actions$.pipe(
    filter((action: any) => action && action.triggerAction),
    map((action: any) => new HideLoader(action))
  );
}
