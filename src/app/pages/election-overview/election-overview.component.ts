/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, OnInit, inject } from '@angular/core';
import { ElectionService } from '../../shared/services/election.service';
import { ElectionModel, ElectionOverviewModel } from '../../shared/models/election.model';
import { Router } from '@angular/router';
import { GuardService } from '../../shared/guard.service';
import { switchMap, finalize } from 'rxjs/operators';
import { CachedUserService } from 'src/app/shared/services/cached-user.service';
import { TranslateService } from '@ngx-translate/core';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';

@Component({
  selector: 'app-election-overview',
  templateUrl: './election-overview.component.html',
  styleUrls: ['./election-overview.component.scss'],
  standalone: false,
})
export class ElectionOverviewComponent implements OnInit {
  private readonly cachedUserService = inject(CachedUserService);
  private readonly electionService = inject(ElectionService);
  private readonly router = inject(Router);
  private readonly snackbarService = inject(SnackbarService);
  private readonly roleService = inject(GuardService);
  private readonly translateService = inject(TranslateService);

  public elections: ElectionOverviewModel[] = [];
  public isWahlverwalter: boolean = false;
  public loadingElections: boolean = false;

  public ngOnInit(): void {
    this.loadElections();

    this.roleService.isWahlverwalter().subscribe((isW) => (this.isWahlverwalter = isW));
  }

  public editElection(event: any): void {
    event.cancel = true;
    const electionId = event.data.id;
    this.router.navigate(['-', 'elections', electionId, 'modify']);
  }

  public selectElection(election: ElectionModel): void {
    if (!election || !election.id) {
      return; // a click on the footer counts as a row-click, but is not an actual row
    }
    this.router.navigate(['-', 'elections', election.id]);
  }

  public deleteElection(id: string): void {
    this.electionService.delete(id).subscribe({
      next: (result) => {
        this.snackbarService.success(this.translateService.instant('ELECTION_DELETED'));
      },
      error: (error) => {
        this.snackbarService.error(this.translateService.instant('ELECTION_DELETED_FAILED'));
      },
      complete: () => {
        this.loadElections();
      },
    });
  }

  public modfiyOrCreateElection(): void {
    this.router.navigate(['-', 'elections', 'modify']);
  }

  private loadElections(): void {
    this.loadingElections = true;
    this.cachedUserService
      .getActiveTenant()
      .pipe(
        switchMap(() => this.electionService.getAll()),
        finalize(() => {
          this.loadingElections = false;
        })
      )
      .subscribe(
        (elections) => (this.elections = elections.filter((el) => !el.isArchived)),
        () => this.snackbarService.error(this.translateService.instant('ELECTIONS_LOAD_FAILED'))
      );
  }
}
