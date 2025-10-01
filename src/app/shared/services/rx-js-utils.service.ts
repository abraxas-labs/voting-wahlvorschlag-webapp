/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MonoTypeOperatorFunction, Observable, throwError } from 'rxjs';
import { catchError, map, tap, toArray } from 'rxjs/operators';
import { SnackbarService } from './snackbar.service';

const DEFAULT_ERROR_MSG = 'MSG_ERROR';
@Injectable({
  providedIn: 'root',
})
export class RxJsUtilsService {
  constructor(
    private translateService: TranslateService,
    private snackbar: SnackbarService
  ) {}

  public static and(ov: Observable<boolean[]>): Observable<boolean> {
    return ov.pipe(
      toArray(),
      map((x) => x.every((y) => y.every((z) => z)))
    );
  }

  public toastDefault<T>(doneMsgKey?: string): MonoTypeOperatorFunction<T> {
    return this.toast(this.translateService.instant(DEFAULT_ERROR_MSG), doneMsgKey);
  }

  public toast<T>(errMsgKey: string, doneMsgKey?: string): MonoTypeOperatorFunction<T> {
    return (ov) => {
      ov = ov.pipe(
        catchError((err) => {
          let errorMsg = errMsgKey;

          const httpErrKey = `HTTP_ERROR.${err.status}`;
          if (
            err.status &&
            errMsgKey === this.translateService.instant(DEFAULT_ERROR_MSG) &&
            this.translateService.instant(httpErrKey) !== httpErrKey
          ) {
            errorMsg = this.translateService.instant(httpErrKey);
          }

          this.snackbar.error(errorMsg);
          return throwError(err);
        })
      );

      if (doneMsgKey) {
        ov = ov.pipe(tap(() => this.snackbar.success(doneMsgKey)));
      }

      return ov;
    };
  }
}
