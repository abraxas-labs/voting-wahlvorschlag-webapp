/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthenticationService, AuthorizationService } from '@abraxas/base-components';
import { filter, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AwaitTenantGuard {
  private authentication = inject(AuthenticationService);
  private authorization = inject(AuthorizationService);

  public canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authentication.authenticated) {
      return this.waitForActiveTenant();
    }

    const authChanged = this.authentication.authenticationChanged;
    return authChanged.pipe(
      filter((v) => v),
      switchMap(() => this.waitForActiveTenant())
    );
  }

  private waitForActiveTenant(): Observable<boolean> {
    return of(this.authorization.getActiveTenant()).pipe(map(() => true));
  }
}
