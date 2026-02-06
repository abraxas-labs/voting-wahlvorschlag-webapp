/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import {
  DialogService,
  PaginatorComponent,
  SelectionChange,
  SortDirective,
  TableDataSource,
} from '@abraxas/base-components';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { GuardService } from 'src/app/shared/guard.service';
import { CandidateModel } from 'src/app/shared/models/candidate.model';
import { ListCandidateModel, newListCandidateModel } from 'src/app/shared/models/ListCandidate.model';
import { CandidateService } from 'src/app/shared/services/candidate.service';
import { RxJsUtilsService } from 'src/app/shared/services/rx-js-utils.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { v4 as uuid } from 'uuid';
import { ElectionModel, ElectionType } from '../../shared/models/election.model';
import { ListModel } from '../../shared/models/list.model';
import { SettingsModel } from '../../shared/models/settings.model';
import { SettingsService } from '../../shared/services/settings.service';
import { CandidacyDetailsComponent } from '../candidacy-details/candidacy-details.component';
import { CandidacyModifyComponent } from '../candidacy-modify/candidacy-modify.component';

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

  @ViewChild('candidateSort') public candidateSort: SortDirective;

  public candidates: ListCandidateModel[] = [];
  public initialCandidacies: ListCandidateModel[] = [];
  public selected?: ListCandidateModel;
  public hasChanges: boolean = false;
  public candidate?: CandidateModel;
  public canEdit: boolean = false;
  public loading: boolean = false;
  public saving: boolean = false;
  public settings: SettingsModel = null;
  public isWahlverwalter: boolean = false;

  @Input() public election: ElectionModel;
  @Input() public list: ListModel;
  @Output() public hasChangesChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  public dataSource = new TableDataSource<ListCandidateModel>(this.candidates);
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
    return !this.candidates || this.nrOfMandates <= this.candidates.length;
  }

  public saveChanges(): void {
    this.saving = true;
    const submitCandidates = this.candidates.map((c) => {
      return {
        ...c,
        ballotFamilyName: c.ballotFamilyName || c.familyName,
        ballotFirstName: c.ballotFirstName || c.firstName,
        ballotOccupationalTitle: c.ballotOccupationalTitle || c.occupationalTitle,
        ballotLocality: c.ballotLocality || c.locality,
      };
    });

    const clonedCandidates: ListCandidateModel[] = [];
    // Remove clones from the list
    submitCandidates
      .filter((c) => c.cloned)
      .forEach((c) => {
        const index = submitCandidates.findIndex((c2) => c.uuid === c2.uuid);
        const submitCandidateToRemove = submitCandidates[index];
        submitCandidates.splice(index, 1);

        if (submitCandidateToRemove.isOriginal) {
          clonedCandidates.push(submitCandidateToRemove);
        }
      });
    let candidatesToSave = [...submitCandidates, ...clonedCandidates];
    candidatesToSave.sort((a, b) => this.sortCandidateAscendingWithIndexAndOrderIndex(a, b));
    this.candidateService
      .batchUpdate(this.election.id, this.list.id, candidatesToSave)
      .pipe(
        this.rxUtils.toastDefault(),
        finalize(() => (this.saving = false))
      )
      .subscribe((cs) => {
        this.processCandidates(cs);
        this.refreshExpandedCandidates();
        this.updateHasChanges();
        this.hasChanges = false;
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

  public createCandidate(candidacy: ListCandidateModel, nextRequested: boolean): void {
    candidacy.orderIndex = this.candidates.length + 1;
    this.candidates.push({
      ...candidacy,
    });
    this.refreshExpandedCandidates();
    this.dataSource.data = this.candidates;
    if (!nextRequested) {
      this.candidate = null;
    }
    this.saveChanges();
  }

  public modifyCandidate(candidacy: ListCandidateModel, nextRequested: boolean): void {
    this.candidates = this.candidates.map((c) => {
      if (c.uuid === candidacy.uuid) {
        return {
          ...c,
          ...candidacy,
        };
      }
      if (c.uuid === candidacy.cloneUuid) {
        return {
          ...c,
          ...candidacy,
          uuid: c.uuid,
          cloneUuid: c.cloneUuid,
        };
      }
      return c;
    });
    this.refreshExpandedCandidates();
    this.dataSource.data = this.candidates;
    if (!nextRequested) {
      this.candidate = null;
    }
    this.updateHasChanges();
  }

  public isTagged(candidate: CandidateModel, field: string): boolean {
    return candidate.markings.findIndex((f) => f.field === field) !== -1;
  }

  public addCandidacy() {
    const newcandidate = newListCandidateModel();
    let dialogRef = this.dialogService.open(CandidacyModifyComponent, {
      data: {
        election: this.election,
        settings: this.settings,
        candidacy: newcandidate,
        maxCandidateCount: this.nrOfMandates,
        candidateCount: this.candidates.length,
      },
    });

    dialogRef.componentInstance.formSubmit.subscribe((data) => {
      if (!this.hasNrOfMandatesReached) {
        this.createCandidate(data.candidacy, data.nextRequested);
      } else {
        this.snackbarService.warning(
          this.translateService.instant('CANDIDACY.REACHED_MAXIMUM_CANDIDATES_WARNING')
        );
      }
    });
  }

  public modifyCandidacy(candidate: ListCandidateModel): void {
    let dialogRef = this.dialogService.open(CandidacyModifyComponent, {
      data: {
        election: this.election,
        settings: this.settings,
        candidacy: candidate,
        maxCandidateCount: this.nrOfMandates,
        candidateCount: this.candidates.length,
      },
    });
    dialogRef.componentInstance.formSubmit.subscribe((data) => {
      this.modifyCandidate(data.candidacy, data.nextRequested);
    });
  }

  public showDetailsModal(candidate: ListCandidateModel): void {
    this.candidate = candidate;
    this.dialogService.open(CandidacyDetailsComponent, {
      data: {
        election: this.election,
        settings: this.settings,
        candidacy: this.candidate,
        listId: this.list.id,
      },
    });
  }

  public remove(): void {
    const index = this.candidates.indexOf(this.selected);
    this.candidates
      .filter((c) => c.cloneUuid === this.candidates[index].uuid)
      .forEach((c) => (c.cloned = false));
    this.candidates.splice(index, 1);
    this.candidates.forEach((c) => {
      if (!c.cloned) {
        delete c.cloneOrderIndex;
      }
    });
    this.refreshExpandedCandidates();
    this.updateCandidatePositions();
    this.dataSource.data = this.candidates;
    this.updateHasChanges();
  }

  public preCumulate(): void {
    if (!this.selected || this.selected.cloned) {
      return;
    }

    const candidateIndex = this.candidates.findIndex((c2) => c2.uuid === this.selected.uuid);
    const candidate = this.candidates[candidateIndex];
    candidate.cloned = true;
    const newCandidate = { ...candidate };
    newCandidate.uuid = uuid();
    candidate.cloneUuid = newCandidate.uuid;
    newCandidate.cloneUuid = candidate.uuid;
    newCandidate.isOriginal = false;
    newCandidate.cloneOrderIndex = candidate.orderIndex + 1;
    candidate.cloneOrderIndex = candidate.orderIndex + 1;
    this.candidates.splice(candidateIndex + 1, 0, newCandidate);
    this.updateCandidatePositions();
    this.dataSource.data = this.candidates;
    this.updateHasChanges();
  }

  public reorderCandidates(updatedList: ListCandidateModel[]): void {
    this.candidates = updatedList;
    this.updateCandidatePositions();
    this.refreshExpandedCandidates();
  }

  public async moveCandidate(previousIndex: number, newIndex: number): Promise<void> {
    if (previousIndex === newIndex) {
      return;
    }

    const movedCandidate = this.candidates.splice(previousIndex, 1)[0];
    this.candidates.splice(newIndex, 0, movedCandidate);

    // First, update the index of all base candidates (isOriginal: true)
    let updatedIndex = 1;
    this.candidates.forEach((candidate) => {
      if (candidate.isOriginal) {
        candidate.index = updatedIndex;
        updatedIndex++;
      }
    });

    // Now handle clones (isOriginal: false) for each base candidate
    this.candidates.forEach((candidate) => {
      if (!candidate.isOriginal) {
        const baseCandidate = this.candidates.find((c) => c.uuid === candidate.originalUuid);

        if (baseCandidate) {
          // Update the clone's index to match the current index of its base candidate
          candidate.index = baseCandidate.index;
        }
      }
    });

    this.reorderCandidates(this.candidates);
    this.updateHasChanges();
  }

  private updateCandidatePositions(): void {
    const processedCandidates = new Set();

    for (let i = 1; i <= this.candidates.length; i++) {
      const currentCandidate = this.candidates[i - 1];
      const alreadyProcessed = processedCandidates.has(currentCandidate.originalUuid);
      const candidates = this.candidates.filter((c) => c.originalUuid === currentCandidate.originalUuid);

      for (const candidate of candidates) {
        if (!alreadyProcessed) {
          candidate.orderIndex = i;
        } else {
          candidate.cloneOrderIndex = i;
        }
      }

      processedCandidates.add(currentCandidate.originalUuid);
    }
  }

  private sortCandidateAscendingWithIndexAndOrderIndex(a: ListCandidateModel, b: ListCandidateModel): number {
    // Check if both objects have the 'index' property
    if ('index' in a && 'index' in b) {
      if (a.index !== b.index) {
        return a.index - b.index; // Sort by index
      } else {
        return a.orderIndex - b.orderIndex; // If index is same, sort by orderIndex
      }
    } else if ('index' in a) {
      return -1; // 'a' has index, move it before 'b'
    } else if ('index' in b) {
      return 1; // 'b' has index, move it before 'a'
    } else {
      return a.orderIndex - b.orderIndex; // Neither has index, sort by orderIndex directly
    }
  }

  private refreshExpandedCandidates(): void {
    const candidateList: ListCandidateModel[] = [];

    for (const candidate of this.candidates) {
      const foundCandidate = candidateList.find((c) => c.id === candidate.id && c.uuid === candidate.uuid);
      if (foundCandidate) {
        if (candidate.cloned && foundCandidate.id == candidate.id) {
          candidateList.push({ ...candidate, orderIndex: candidate.cloneOrderIndex });
        }
      } else {
        candidateList.push(candidate);
      }
    }
    this.candidates = candidateList;
    this.dataSource.data = this.candidates;
  }

  private processCandidates(candidates: CandidateModel[]): void {
    this.candidates = candidates.map((c) => {
      const originalUuid = uuid();
      return {
        ...c,
        uuid: originalUuid,
        originalUuid: originalUuid,
        isOriginal: true,
      };
    });
    // Create copies of cloned/preCumulated candidates
    this.candidates
      .filter((c) => c.cloned)
      .sort((c1, c2) => c1.cloneOrderIndex - c2.cloneOrderIndex)
      .forEach((c) => {
        const clone: ListCandidateModel = {
          ...c,
          uuid: uuid(),
          cloneUuid: c.uuid,
          isOriginal: false,
        };
        this.candidates.splice(clone.cloneOrderIndex - 1, 0, clone);
        c.cloneUuid = clone.uuid;
      });
    this.initialCandidacies = this.candidates.map((c) => ({
      ...c,
      markings: [...c.markings],
    }));
    this.dataSource.data = this.candidates;
  }

  private updateHasChanges(): void {
    this.hasChanges = this.checkChanges();
    this.hasChangesChange.emit(this.hasChanges);
  }

  private checkChanges(): boolean {
    return this.arraysAreDifferent(this.initialCandidacies, this.candidates);
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
