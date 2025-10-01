/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { AuthorizationService, UserService } from '@abraxas/base-components';
import { Injectable } from '@angular/core';
import { forkJoin, from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ListModel } from './models/list.model';
import { RxJsUtilsService } from './services/rx-js-utils.service';

@Injectable({
  providedIn: 'root',
})
export class GuardService {
  constructor(
    private userService: UserService,
    private auth: AuthorizationService
  ) {}

  public isWahlverwalter(): Observable<boolean> {
    return from(this.auth.hasRoleAwaitAuth('Wahlverwalter'));
  }

  public isUser(): Observable<boolean> {
    return from(this.auth.hasRoleAwaitAuth('Benutzer'));
  }

  public canEditList(list: ListModel): Observable<boolean> {
    return this.isWahlverwalter().pipe(
      switchMap((isWV) => {
        if (isWV) {
          return from([true]);
        }

        if (list.locked) {
          return from([false]);
        }

        const canAccess = from(this.userService.getUser()).pipe(
          map(
            (u) =>
              list.deputyUsers.indexOf(u.loginid) !== -1 ||
              list.createdBy === u.loginid ||
              list.representative === u.loginid
          )
        );

        return forkJoin(this.isUser(), canAccess).pipe(RxJsUtilsService.and);
      })
    );
  }
}
