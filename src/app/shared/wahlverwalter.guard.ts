/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { GuardService } from './guard.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WahlverwalterGuard {
  constructor(private roleService: GuardService) {}

  public canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.roleService.isWahlverwalter();
  }
}
