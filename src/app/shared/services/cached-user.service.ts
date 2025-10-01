/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Injectable, OnDestroy } from '@angular/core';
import { forkJoin, from, Observable, Subscription } from 'rxjs';
import { flatMap, map, shareReplay } from 'rxjs/operators';
import { UserModel } from '../models/user.model';
import { PartyUserModel } from '../models/party-user.model';
import { PartyUserService } from './party-user.service';
import { AuthorizationService, Tenant, User, UserService } from '@abraxas/base-components';

@Injectable({
  providedIn: 'root',
})
export class CachedUserService implements OnDestroy {
  private tenantUsersCache: { [id: string]: Observable<UserModel[]> } = {};

  private readonly tenantSub: Subscription;

  constructor(
    private userService: UserService,
    private partyUserService: PartyUserService,
    private auth: AuthorizationService
  ) {
    this.tenantSub = this.auth.activeTenantChanged.subscribe(() => (this.tenantUsersCache = {}));
  }

  private static mapToUserModel(u: PartyUserModel): UserModel {
    const user = new UserModel();
    Object.assign(user, u);
    return user;
  }

  public getCurrentUser(): Observable<User> {
    return from(this.userService.getUser());
  }

  public getActiveTenant(): Observable<Tenant> {
    return from(this.auth.getActiveTenant());
  }

  public getUsers(tenants: string[]): Observable<UserModel[]> {
    const ovUsers = tenants.map((tid) => {
      let users = this.tenantUsersCache[tid];
      if (!users) {
        this.tenantUsersCache[tid] = from(this.partyUserService.getUsersForTenant(tid)).pipe(
          map((us) => us.map((u) => CachedUserService.mapToUserModel(u))),
          shareReplay(1)
        );
        users = this.tenantUsersCache[tid];
      }
      return users;
    });

    return forkJoin(ovUsers).pipe(flatMap((u) => u));
  }

  public ngOnDestroy(): void {
    this.tenantSub.unsubscribe();
  }
}
