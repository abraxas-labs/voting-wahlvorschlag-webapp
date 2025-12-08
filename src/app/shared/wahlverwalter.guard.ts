/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { GuardService } from './guard.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WahlverwalterGuard {
  private roleService = inject(GuardService);

  public canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.roleService.isWahlverwalter();
  }
}
