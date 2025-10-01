/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PartyUserModel } from '../models/party-user.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PartyUserService {
  constructor(private httpClient: HttpClient) {}

  public get(loginId: string): Observable<PartyUserModel> {
    return this.httpClient.get<PartyUserModel>(this.url(loginId)).pipe(map((u) => this.mapUser(u)));
  }

  public getAll(): Observable<PartyUserModel[]> {
    return this.httpClient
      .get<PartyUserModel[]>(this.url())
      .pipe(map((users) => users.map((u) => this.mapUser(u))));
  }

  public getUsersForTenant(tenantId: string): Observable<PartyUserModel[]> {
    return this.httpClient
      .get<PartyUserModel[]>(`${this.url()}/tenant/${encodeURIComponent(tenantId)}`)
      .pipe(map((users) => users.map((u) => this.mapUser(u))));
  }

  public create(user: PartyUserModel): Observable<PartyUserModel> {
    const request: any = Object.assign({}, user);
    request.tenants = user.tenants.map((t) => t.id);
    return this.httpClient.post<PartyUserModel>(this.url(), request).pipe(map((u) => this.mapUser(u)));
  }

  public update(user: PartyUserModel): Observable<PartyUserModel> {
    const request: any = Object.assign({}, user);
    request.tenants = user.tenants.map((t) => t.id);
    return this.httpClient
      .put<PartyUserModel>(this.url(user.loginid), request)
      .pipe(map((u) => this.mapUser(u)));
  }

  public delete(loginid: string): Observable<void> {
    return this.httpClient.delete<void>(this.url(loginid));
  }

  private mapUser(user: PartyUserModel): PartyUserModel {
    user.tenantDescription = user.tenants.map((t) => t.name).join(', ');
    return user;
  }

  private url(loginId?: string): string {
    const optionalEncodedLoginId = loginId ? '/' + encodeURIComponent(loginId) : '';
    return environment.eawv + `/users${optionalEncodedLoginId}`;
  }
}
