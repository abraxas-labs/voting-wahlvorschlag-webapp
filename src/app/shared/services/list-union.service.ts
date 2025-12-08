/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ListUnionModel } from '../models/list-union-model';

@Injectable({
  providedIn: 'root',
})
export class ListUnionService {
  private httpClient = inject(HttpClient);

  public createOrUpdateUnion(
    electionId: string,
    listIds: string[],
    rootListId?: string
  ): Observable<ListUnionModel> {
    const isSubUnion = !!rootListId;
    let url = this.url(electionId, isSubUnion);
    if (isSubUnion) {
      url += `/${encodeURIComponent(rootListId)}`;
    }
    return this.httpClient.put<ListUnionModel>(url, listIds);
  }

  public removeListFromUnion(electionId: string, listId: string, isSubUnion: boolean): Observable<void> {
    const url = `${this.url(electionId, isSubUnion)}/${encodeURIComponent(listId)}`;
    return this.httpClient.delete<void>(url);
  }

  private url(electionId: string, isSubUnion: boolean): string {
    const subPath = isSubUnion ? '/sub' : '';
    return `${environment.eawv}/elections/${encodeURIComponent(electionId)}/lists/unions${subPath}`;
  }
}
