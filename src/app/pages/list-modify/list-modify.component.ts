/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { GuardService } from '../../shared/guard.service';
import { ElectionModel, ElectionType } from '../../shared/models/election.model';
import { ListModel, newListModel } from '../../shared/models/list.model';
import { UserModel } from '../../shared/models/user.model';
import { CachedUserService } from '../../shared/services/cached-user.service';
import { ElectionService } from '../../shared/services/election.service';
import { ListService } from '../../shared/services/list.service';
import { RxJsUtilsService } from '../../shared/services/rx-js-utils.service';
import { ThemeService } from '@abraxas/voting-lib';

@Component({
  selector: 'app-list-modify',
  templateUrl: './list-modify.component.html',
  styleUrls: ['./list-modify.component.scss'],
  standalone: false,
})
export class ListModifyComponent {
  public election!: ElectionModel;
  public list!: ListModel;
  public users: UserModel[] = [];
  public isWahlverwalter: boolean = false;
  public loading: boolean = false;
  public saving: boolean = false;

  private theme: string;

  constructor(
    activatedRoute: ActivatedRoute,
    private rxUtils: RxJsUtilsService,
    private cachedUserService: CachedUserService,
    private roleService: GuardService,
    private translateService: TranslateService,
    private router: Router,
    private listService: ListService,
    private electionService: ElectionService,
    private readonly themeService: ThemeService
  ) {
    this.themeService.theme$.subscribe((theme) => {
      this.theme = theme;
    });

    const electionId = activatedRoute.snapshot.params.electionId;
    const listId = activatedRoute.snapshot.params.listId;

    this.loadInitialData(electionId, listId);
  }

  public get isMajorz(): boolean {
    return this.election.electionType === ElectionType.Majorz;
  }

  public get isValid(): boolean {
    return !!this.list.name && !!this.list.representative;
  }

  public showListOverview(): void {
    this.router.navigate(['-', 'elections', this.election.id]);
  }

  public save(): void {
    this.saveList();
  }

  public saveList(): void {
    this.saving = true;
    if (!this.list.id) {
      this.listService
        .create(this.election.id, this.list)
        .pipe(
          this.rxUtils.toastDefault(this.translateService.instant('LIST.MSG_SAVED')),
          finalize(() => (this.saving = false))
        )
        .subscribe(() => this.showListOverview());
      return;
    }

    this.listService
      .update(this.election.id, this.list, this.theme)
      .pipe(
        this.rxUtils.toastDefault(this.translateService.instant('LIST.MSG_SAVED')),
        finalize(() => (this.saving = false))
      )
      .subscribe(() => this.showListOverview());
  }

  private loadInitialData(electionId: string, listId: string): void {
    const isWV$ = this.roleService.isWahlverwalter();
    const election$ = this.electionService.get(electionId);
    const list$ = !!listId
      ? this.listService.get(electionId, listId)
      : forkJoin(this.cachedUserService.getActiveTenant(), this.cachedUserService.getCurrentUser()).pipe(
          map(([t, u]) => newListModel(t.id, u.loginid))
        );
    const users$ = list$.pipe(
      switchMap((l) => this.cachedUserService.getUsers([l.responsiblePartyTenantId]))
    );

    this.loading = true;

    forkJoin(isWV$, election$, users$, list$)
      .pipe(
        this.rxUtils.toastDefault(),
        finalize(() => (this.loading = false))
      )
      .subscribe(([isWv, election, users, list]) => {
        this.isWahlverwalter = isWv;
        this.election = election;
        this.users = users;
        this.list = list;
        this.ensureUserInList();
      });
  }

  private ensureUserInList(): void {
    const accessibleLoginIds = this.users.map((u) => u.loginid);

    if (!accessibleLoginIds.includes(this.list.representative)) {
      this.list.representative = undefined;
    }

    this.list.deputyUsers = this.list.deputyUsers.filter((r) => accessibleLoginIds.includes(r));
    this.list.memberUsers = this.list.memberUsers.filter((r) => accessibleLoginIds.includes(r));
  }
}
