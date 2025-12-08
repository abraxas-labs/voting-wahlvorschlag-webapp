/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ListExportType, ListModel, ListState } from '../models/list.model';
import { DownloadService } from './download.service';

@Injectable({
  providedIn: 'root',
})
export class ListService {
  private httpClient = inject(HttpClient);
  private download = inject(DownloadService);

  public static mapLists(lists: ListModel[]): ListModel[] {
    return lists.map((l) => ListService.mapList(l));
  }

  public static mapList(list: ListModel): ListModel {
    list.creationDate = new Date(list.creationDate);

    if (list.modifiedDate) {
      list.modifiedDate = new Date(list.modifiedDate);
    }

    return list;
  }

  public getAll(electionId: string): Observable<ListModel[]> {
    return this.httpClient
      .get<ListModel[]>(this.url(electionId))
      .pipe(map((lists) => ListService.mapLists(lists)));
  }

  public create(electionId: string, list: ListModel): Observable<ListModel> {
    return this.httpClient
      .post<ListModel>(this.url(electionId), list)
      .pipe(map((l) => ListService.mapList(l)));
  }

  public get(electionId: string, listId: string): Observable<ListModel> {
    return this.httpClient
      .get<ListModel>(this.url(electionId, listId))
      .pipe(map((l) => ListService.mapList(l)));
  }

  public update(electionId: string, list: ListModel, theme: string): Observable<ListModel> {
    return this.httpClient
      .put<ListModel>(`${this.url(electionId, list.id)}?theme=${encodeURIComponent(theme)}`, list)
      .pipe(map((l) => ListService.mapList(l)));
  }

  public changeState(
    electionId: string,
    listId: string,
    newState: ListState,
    theme: string
  ): Observable<ListModel> {
    const model = { state: newState };
    return this.httpClient
      .patch<ListModel>(`${this.url(electionId, listId)}?theme=${encodeURIComponent(theme)}`, model)
      .pipe(map((l) => ListService.mapList(l)));
  }

  public delete(electionId: string, listId: string): Observable<void> {
    return this.httpClient.delete<void>(this.url(electionId, listId));
  }

  public export(electionId: string, listId: string, type: ListExportType): Observable<void> {
    return this.download.download(`${this.url(electionId, listId)}/export/${encodeURIComponent(type)}`);
  }

  private url(electionId: string, listId?: string): string {
    const optionalEncodedListId = listId ? '/' + encodeURIComponent(listId) : '';
    return environment.eawv + `/elections/${encodeURIComponent(electionId)}/lists${optionalEncodedListId}`;
  }
}
