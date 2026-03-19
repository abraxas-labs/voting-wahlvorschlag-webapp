/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { DialogService, SelectionChange, SortDirective, TableDataSource, } from '@abraxas/base-components';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { GuardService } from 'src/app/shared/guard.service';
import { CandidateModel, newCandidateModel } from 'src/app/shared/models/candidate.model';
import { CandidateService } from 'src/app/shared/services/candidate.service';
import { RxJsUtilsService } from 'src/app/shared/services/rx-js-utils.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { ElectionModel, ElectionType } from '../../shared/models/election.model';
import { ListModel } from '../../shared/models/list.model';
import { SettingsModel } from '../../shared/models/settings.model';
import { SettingsService } from '../../shared/services/settings.service';
import { CandidacyDetailsComponent } from '../candidacy-details/candidacy-details.component';
import { CandidacyModifyComponent } from '../candidacy-modify/candidacy-modify.component';
import { ListCandidateModel } from '../../shared/models/list-candidate.model';

@Component({
  selector: 'app-candidacy-overview',
  templateUrl: './candidacy-overview.component.html',
  styleUrls: ['./candidacy-overview.component.scss'],
  standalone: false,
})
export class CandidacyOverviewComponent implements OnInit, OnDestroy, AfterViewInit {
  private roleService = inject(GuardService);
  private candidateService = inject(CandidateService);
  private snackbarService = inject(SnackbarService);
  private rxUtils = inject(RxJsUtilsService);
  private settingsService = inject(SettingsService);
  private dialogService = inject(DialogService);
  private translateService = inject(TranslateService);
  private readonly candidacyDialogWidth = '45rem';

  @ViewChild('candidateSort') public candidateSort: SortDirective;

  public expandedCandidates: ListCandidateModel[] = [];
  public candidates: CandidateModel[] = [];
  public initialCandidates: CandidateModel[] = [];
  public selected?: ListCandidateModel;
  public hasChanges: boolean = false;
  public canEdit: boolean = false;
  public loading: boolean = false;
  public saving: boolean = false;
  public settings: SettingsModel = null;
  public isWahlverwalter: boolean = false;

  @Input() public election: ElectionModel;
  @Input() public list: ListModel;
  @Output() public hasChangesChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  public dataSource = new TableDataSource<ListCandidateModel>(this.expandedCandidates);
  public columns = TableColumn;
  public columnsToDisplay: string[] = [
    TableColumn.icons,
    TableColumn.number,
    TableColumn.firstName,
    TableColumn.familyName,
    TableColumn.dateOfBirth,
    TableColumn.incumbent,
    TableColumn.street,
    TableColumn.locality,
    'actions',
  ];
  private roleSubscription: Subscription | undefined;

  public ngAfterViewInit(): void {
    this.dataSource.sort = this.candidateSort;
  }

  public ngOnInit(): void {
    this.roleService.isWahlverwalter().subscribe((isW) => (this.isWahlverwalter = isW));
    this.roleSubscription = this.roleService
      .canEditList(this.list)
      .pipe(this.rxUtils.toastDefault())
      .subscribe((res) => {
        this.canEdit = !this.election.isArchived ? res : false;
      });

    if (this.election.electionType === ElectionType.Majorz) {
      this.columnsToDisplay = this.columnsToDisplay.filter((c) => c !== TableColumn.number);
    }

    this.loading = true;
    const candidates$ = this.candidateService.getAll(this.election.id, this.list.id);
    const settings$ = this.settingsService.get();

    forkJoin(candidates$, settings$)
      .pipe(
        this.rxUtils.toastDefault(),
        finalize(() => (this.loading = false))
      )
      .subscribe(([candidates, settings]) => {
        this.settings = settings;
        this.processCandidates(candidates);
        this.refreshExpandedCandidates();
      });
  }

  public ngOnDestroy(): void {
    this.roleSubscription.unsubscribe();
  }

  public get isProporz(): boolean {
    return this.election && this.election.electionType === ElectionType.Proporz;
  }

  public get nrOfMandates(): number {
    if (!this.election) {
      return 0;
    }

    return this.election.domainsOfInfluence.map((doi) => doi.numberOfMandates).reduce((a, b) => a + b, 0);
  }

  public get hasNrOfMandatesReached(): boolean {
    return this.nrOfMandates <= this.expandedCandidates.length;
  }

  public saveChanges(): void {
    this.saving = true;
    const candidatesToSave = this.candidates.map((c) => {
      return {
        ...c,
        ballotFamilyName: c.ballotFamilyName || c.familyName,
        ballotFirstName: c.ballotFirstName || c.firstName,
        ballotOccupationalTitle: c.ballotOccupationalTitle || c.occupationalTitle,
        ballotLocality: c.ballotLocality || c.locality,
      };
    });

    candidatesToSave.sort((a, b) => a.index - b.index);
    this.candidateService
      .batchUpdate(this.election.id, this.list.id, candidatesToSave)
      .pipe(
        this.rxUtils.toastDefault(),
        finalize(() => (this.saving = false))
      )
      .subscribe((cs) => {
        this.processCandidates(cs);
        this.refreshExpandedCandidates();
        this.hasChanges = false;
        this.hasChangesChange.emit(this.hasChanges);
        this.snackbarService.success(this.translateService.instant('CANDIDACY.MSG_LIST_UPDATE_SUCCESS'));
      });
  }

  public onSelectionChange(selection: SelectionChange<ListCandidateModel>): void {
    if (selection.after.length > 0) {
      this.selected = selection.after[0].value;
    } else {
      this.selected = null;
    }
  }

  public createCandidate(candidacy: CandidateModel): void {
    candidacy.orderIndex = this.expandedCandidates.length + 1;
    candidacy.index = candidacy.orderIndex;
    this.candidates.push(candidacy);
    this.refreshExpandedCandidates();
    this.saveChanges();
  }

  public isTagged(candidate: ListCandidateModel, field: string): boolean {
    return candidate.candidate.markings.findIndex((f) => f.field === field) !== -1;
  }

  public addCandidacy() {
    const newCandidate = newCandidateModel(this.expandedCandidates.length + 1);
    let dialogRef = this.dialogService.open(CandidacyModifyComponent, {
      data: {
        election: this.election,
        settings: this.settings,
        candidacy: newCandidate,
        maxCandidateCount: this.nrOfMandates,
        candidateCount: this.expandedCandidates.length,
      },
    },
      this.candidacyDialogWidth);

    dialogRef.componentInstance.formSubmit.subscribe((data) => {
      this.handleCandidateCreated(data.candidacy);
    });
  }

  public modifyCandidacy(candidate: ListCandidateModel): void {
    const dialogRef = this.dialogService.open(
      CandidacyModifyComponent,
      {
        data: {
          election: this.election,
          settings: this.settings,
          candidacy: { ...candidate.candidate, markings: [...candidate.candidate.markings] },
          maxCandidateCount: this.nrOfMandates,
          candidateCount: this.expandedCandidates.length,
        },
      },
      this.candidacyDialogWidth
    );
    dialogRef.componentInstance.formSubmit.subscribe(({ candidacy }) => {
      if (candidacy.index === candidate.candidate.index) {
        this.candidates[candidacy.index - 1] = candidacy;
        this.refreshExpandedCandidates();
        this.updateHasChanges();
      } else {
        // New candidate created via the "next" button of the dialog
        this.handleCandidateCreated(candidacy);
      }
    });
  }

  private handleCandidateCreated(candidate: CandidateModel): void {
    if (this.hasNrOfMandatesReached) {
      this.snackbarService.warning(this.translateService.instant('CANDIDACY.REACHED_MAXIMUM_CANDIDATES_WARNING'));
      return;
    }

    this.createCandidate(candidate);
  }

  public showDetailsModal(candidate: ListCandidateModel): void {
    this.dialogService.open(CandidacyDetailsComponent, {
      data: {
        election: this.election,
        settings: this.settings,
        candidacy: candidate.candidate,
        listId: this.list.id,
      },
    });
  }

  public remove(): void {
    if (this.selected.isCloned) {
      this.selected.candidate.cloned = false;
      delete this.selected.candidate.cloneOrderIndex;
    } else if (this.selected.candidate.cloned) {
      this.selected.candidate.cloned = false;
      this.selected.candidate.index = this.selected.candidate.cloneOrderIndex;
      this.selected.candidate.orderIndex = this.selected.candidate.cloneOrderIndex;
      delete this.selected.candidate.cloneOrderIndex;
    } else {
      this.candidates = this.candidates.filter((c) => c !== this.selected.candidate);
    }

    this.refreshExpandedCandidates();
    this.updateCandidatePositions();
    this.updateHasChanges();
  }

  public preCumulate(): void {
    if (!this.selected || this.selected.candidate.cloned) {
      return;
    }

    this.selected.candidate.cloned = true;
    this.selected.candidate.cloneOrderIndex = this.expandedCandidates.length + 1;
    this.refreshExpandedCandidates();
    this.updateHasChanges();
  }

  public async moveCandidate(previousIndex: number, newIndex: number): Promise<void> {
    if (previousIndex === newIndex) {
      return;
    }

    const movedCandidate = this.expandedCandidates.splice(previousIndex, 1)[0];
    this.expandedCandidates.splice(newIndex, 0, movedCandidate);

    this.updateCandidatePositions();
    this.updateHasChanges();
  }

  private updateCandidatePositions(): void {
    const processedCandidates = new Set<CandidateModel>();

    for (let i = 1; i <= this.expandedCandidates.length; i++) {
      const currentCandidate = this.expandedCandidates[i - 1].candidate;
      const alreadyProcessed = processedCandidates.has(currentCandidate);

      if (alreadyProcessed) {
        currentCandidate.cloned = true;
        currentCandidate.cloneOrderIndex = i;
      } else {
        processedCandidates.add(currentCandidate);
        currentCandidate.cloned = false;
        currentCandidate.index = i;
        currentCandidate.orderIndex = i;
      }
    }

    this.refreshExpandedCandidates();
  }

  private refreshExpandedCandidates(): void {
    this.expandedCandidates = [];

    for (const candidate of this.candidates) {
      this.expandedCandidates.push({ candidate, index: candidate.orderIndex - 1, isCloned: false });
      if (candidate.cloned) {
        this.expandedCandidates.push({ candidate, index: candidate.cloneOrderIndex - 1, isCloned: true });
      }
    }

    this.expandedCandidates.sort((a, b) => a.index - b.index);
    this.dataSource.data = this.expandedCandidates;
  }

  private processCandidates(candidates: CandidateModel[]): void {
    this.initialCandidates = candidates;
    // Create copies of cloned/preCumulated candidates
    this.candidates = candidates.map((c) => ({
      ...c,
      markings: [...c.markings],
    }));
  }

  private updateHasChanges(): void {
    this.hasChanges = this.checkChanges();
    this.hasChangesChange.emit(this.hasChanges);
  }

  private checkChanges(): boolean {
    return this.arraysAreDifferent(this.initialCandidates, this.candidates);
  }

  private arraysAreDifferent(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) {
      return true;
    }
    for (let i = 0; i < arr1.length; i++) {
      const keys = Object.keys(arr1[i]);
      for (let ki = 0; ki < keys.length; ki++) {
        const key = keys[ki];
        if (arr1[i][key] === arr2[i][key]) {
          continue;
        }
        if (Array.isArray(arr1[i][key])) {
          if (!this.arraysAreDifferent(arr1[i][key], arr2[i][key])) {
            continue;
          }
        }
        return true;
      }
    }
    return false;
  }
}

export enum TableColumn {
  icons = 'icons',
  number = 'number',
  firstName = 'firstName',
  familyName = 'familyName',
  dateOfBirth = 'dateOfBirth',
  sex = 'sex',
  incumbent = 'incumbent',
  street = 'street',
  locality = 'locality',
}
