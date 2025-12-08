/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, inject } from '@angular/core';
import { ElectionService } from '../../shared/services/election.service';
import { ElectionOverviewModel } from '../../shared/models/election.model';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-election-archive',
  templateUrl: './election-archive.component.html',
  styleUrls: ['./election-archive.component.scss'],
  standalone: false,
})
export class ElectionArchiveComponent {
  private electionService = inject(ElectionService);
  private snackbarService = inject(SnackbarService);
  private translateService = inject(TranslateService);

  public elections: ElectionOverviewModel[] = [];
  public loadingElections: boolean = true;

  constructor() {
    this.electionService.getAll().subscribe({
      next: (elections) => {
        this.elections = elections.filter((el) => el.isArchived);
      },
      error: () => {
        this.snackbarService.error(this.translateService.instant('ELECTIONS_LOAD_FAILED'));
      },
      complete: () => {
        this.loadingElections = false;
      },
    });
  }
}
