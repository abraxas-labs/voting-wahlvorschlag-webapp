/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import {
  DialogService,
  FilterDirective,
  PaginatorComponent,
  SortDirective,
  TableDataSource,
} from '@abraxas/base-components';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ExportDialogComponent } from 'src/app/shared/components/dialogs/export-dialog/export-dialog.component';
import { ModalDialogComponent } from 'src/app/shared/components/dialogs/modal-dialog/modal-dialog.component';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { GuardService } from '../../shared/guard.service';
import { ElectionModel, ElectionType } from '../../shared/models/election.model';
import { ListModel, ListState } from '../../shared/models/list.model';
import { BallotDocumentService } from '../../shared/services/ballot-document.service';
import { CachedUserService } from '../../shared/services/cached-user.service';
import { CandidateService } from '../../shared/services/candidate.service';
import { ElectionService } from '../../shared/services/election.service';
import { ListUnionService } from '../../shared/services/list-union.service';
import { ListService } from '../../shared/services/list.service';
import { RxJsUtilsService } from '../../shared/services/rx-js-utils.service';
import { EnumValues } from '../../shared/utils/enum-utils';
import { ListSubunionRootComponent } from 'src/app/organisms/list-subunion-root/list-subunion-root.component';
import {
  ListIndentureModifyComponent,
  ListIndentureModifyData,
} from '../list-indenture-modify/list-indenture-modify.component';
import { SelectionModel } from '@angular/cdk/collections';
import { DocumentModel } from 'src/app/shared/models/document.model';
import { ListUnionModel } from 'src/app/shared/models/list-union-model';
import { EnumItemDescription, EnumUtil, ThemeService } from '@abraxas/voting-lib';

@Component({
  selector: 'app-list-overview',
  templateUrl: './list-overview.component.html',
  styleUrls: ['./list-overview.component.scss'],
  standalone: false,
})
export class ListOverviewComponent implements OnInit, AfterViewInit {
  @ViewChild('listPaginator') public listPaginator!: PaginatorComponent;
  @ViewChild('listSort') public listSort!: SortDirective;
  @ViewChild('listFilter') public listFilter!: FilterDirective;
  public election!: ElectionModel;
  public lists!: ListModel[];

  public selectedLists: ListModel[] = [];
  public selection = new SelectionModel<ListModel>(true, []);
  public isAllSelected: boolean = false;

  public statesDropdownItems: { value: ListState; displayValue: string }[] = [];

  public isWahlverwalter: boolean = false;
  public isUser: boolean = false;
  public buttonsDisabled: boolean = false;
  public isMajorzElection: boolean = false;

  public allowUpdating: boolean = true;
  public allowDeleting: boolean = true;

  public loadingElection: boolean = true;
  public loadingLists: boolean = true;
  public updatingListIds: Set<string> = new Set();

  private editableLists: ListModel[] = [];
  private electionId: string;
  private theme: string;

  public listStates: EnumItemDescription<ListState>[] = [];

  public dataSourceLists = new TableDataSource<UiListModel>();
  public listColumns = ListTableColumn;
  public listColumnstoDisplay: string[] = [
    'selection',
    ListTableColumn.nr,
    ListTableColumn.name,
    ListTableColumn.description,
    ListTableColumn.version,
    ListTableColumn.modifyDate,
    ListTableColumn.modifyUser,
    ListTableColumn.state,
    ListTableColumn.validated,
    ListTableColumn.locked,
    ListTableColumn.listUnion,
    ListTableColumn.listSubUnion,
    'actions',
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private rxUtils: RxJsUtilsService,
    private roleService: GuardService,
    private router: Router,
    private cachedUserService: CachedUserService,
    private electionService: ElectionService,
    private listService: ListService,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private snackbarService: SnackbarService,
    private listUnionService: ListUnionService,
    private ballotDocService: BallotDocumentService,
    private candidateService: CandidateService,
    private changeDetect: ChangeDetectorRef,
    private themeService: ThemeService,
    private enumUtil: EnumUtil
  ) {}

  public ngAfterViewInit(): void {
    this.dataSourceLists.paginator = this.listPaginator;
    this.dataSourceLists.sort = this.listSort;
    this.dataSourceLists.filter = this.listFilter;
  }

  public ngOnInit(): void {
    this.themeService.theme$.subscribe((theme) => {
      this.theme = theme;
    });

    this.electionId = this.activatedRoute.snapshot.params.electionId;

    this.cachedUserService
      .getActiveTenant()
      .pipe(this.rxUtils.toastDefault())
      .subscribe(() => {
        this.electionService
          .get(this.electionId)
          .pipe(
            this.rxUtils.toastDefault(),
            finalize(() => (this.loadingElection = false))
          )
          .subscribe((e) => {
            this.election = e;
            this.isMajorzElection = this.election.electionType == ElectionType.Majorz;
            this.spliceTableForMajorzOrProporz();
          });

        this.loadLists();

        this.roleService.isWahlverwalter().subscribe((isWV) => (this.isWahlverwalter = isWV));
        this.roleService.isUser().subscribe((isU) => (this.isUser = isU));
      });
    const stateDropdownValues = [ListState.FormallySubmitted, ListState.Valid];
    this.statesDropdownItems = EnumValues<ListState>(stateDropdownValues).map((ls) => {
      return {
        value: ls,
        displayValue: this.translateService.instant('LIST.STATE_VALUES.' + ls),
      };
    });

    this.listStates = this.enumUtil.getArrayWithDescriptions<ListState>(ListState, 'LIST.STATE_VALUES.');
  }

  public toggleRowWithValue(row: ListModel, value: boolean): void {
    if (value === this.selection.isSelected(row)) {
      this.buttonsDisabled = true;
      return;
    }

    this.toggleRow(row);
  }

  public toggleAllRows(value: boolean) {
    if (value === this.isAllSelected) {
      this.updateIsAllSelected();
      return;
    }

    value ? this.selection.select(...this.dataSourceLists.data) : this.selection.clear();
    this.selectedLists = this.selection.selected;
    this.updateIsAllSelected();
    this.changeDetect.detectChanges();
  }

  private spliceTableForMajorzOrProporz() {
    if (this.election.electionType == ElectionType.Majorz) {
      this.listColumnstoDisplay.splice(this.listColumnstoDisplay.indexOf(ListTableColumn.listUnion), 1);
      this.listColumnstoDisplay.splice(this.listColumnstoDisplay.indexOf(ListTableColumn.listSubUnion), 1);
      this.listColumnstoDisplay.splice(this.listColumnstoDisplay.indexOf(ListTableColumn.description), 1);
    }

    if (!this.isWahlverwalter) {
      this.listColumnstoDisplay.splice(this.listColumnstoDisplay.indexOf(ListTableColumn.locked), 1);
      this.listColumnstoDisplay.splice(this.listColumnstoDisplay.indexOf(ListTableColumn.validated), 1);
      if (this.election.electionType == ElectionType.Proporz) {
        this.listColumnstoDisplay.splice(this.listColumnstoDisplay.indexOf(ListTableColumn.listUnion), 1);
        this.listColumnstoDisplay.splice(this.listColumnstoDisplay.indexOf(ListTableColumn.listSubUnion), 1);
      }
    }
  }

  private toggleRow(row: ListModel): void {
    this.selection.toggle(row);
    this.selectedLists = this.selection.selected;
    this.updateIsAllSelected();
    this.buttonsDisabled = this.selectedLists.length === 0;
  }

  private updateIsAllSelected(): void {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSourceLists.data.length;
    this.isAllSelected = numSelected === numRows;
  }

  private loadLists(): void {
    this.listService
      .getAll(this.electionId)
      .pipe(finalize(() => (this.loadingLists = false)))
      .subscribe((l) => {
        this.dataSourceLists.data = this.mapToUiLists(l);
        this.selection.clear(true);
        this.buttonsDisabled = true;
        this.updateAllowedLists();
      });
  }

  public isMajorz(): boolean {
    return this.election?.electionType === ElectionType.Majorz;
  }

  public deleteList(selectedRow: ListModel): void {
    let dialogRef = this.dialogService.open(ModalDialogComponent, {
      data: {
        header: this.translateService.instant('DIALOG_OPTIONS.DELETE_SELECTION_HEADER'),
        text: this.translateService.instant('DIALOG_OPTIONS.DELETE_SELECTION_TEXT'),
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updatingListIds.add(selectedRow.id);
        this.listService
          .delete(this.election.id, selectedRow.id)
          .pipe(
            this.rxUtils.toastDefault(this.translateService.instant('LIST.MSG_DELETED')),
            finalize(() => {
              this.updatingListIds.delete(selectedRow.id);
              this.loadLists();
            })
          )
          .subscribe(() => {
            this.dataSourceLists.data = this.dataSourceLists.data.filter((l) => selectedRow.id === l.id);
            this.removeListFromUnions(selectedRow.id, true);
            this.removeListFromUnions(selectedRow.id, false);
            this.loadLists();
          });
      }
    });
  }

  public editList(list: any): void {
    list.cancel = true;
    this.router.navigate(['-', 'elections', this.election.id, 'lists', list.id, 'modify']);
  }

  public updateList(list: ListModel): void {
    this.updatingListIds.add(list.id);
    this.listService
      .update(this.election.id, list, this.theme)
      .pipe(
        this.rxUtils.toastDefault(this.translateService.instant('LIST.MSG_SAVED')),
        finalize(() => this.updatingListIds.delete(list.id))
      )
      .subscribe(() => this.updateAllowedLists());
  }

  public showExport(): void {
    this.dialogService.open(ExportDialogComponent, {
      data: { election: this.election, lists: this.selectedLists },
    });
  }

  public detail(id: string): void {
    this.router.navigate(['lists', id], {
      relativeTo: this.activatedRoute,
    });
  }

  public deleteLists(lists: string[]): void {
    let dialogRef = this.dialogService.open(ModalDialogComponent, {
      data: {
        header: this.translateService.instant('DIALOG_OPTIONS.DELETE_SELECTION_HEADER'),
        text: this.translateService.instant('DIALOG_OPTIONS.DELETE_SELECTION_TEXT'),
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        forkJoin(
          lists.map((list) => {
            this.updatingListIds.add(list);
            return this.listService.delete(this.election.id, list);
          })
        )
          .pipe(
            this.rxUtils.toastDefault(this.translateService.instant('LIST.MSG_DELETED')),
            finalize(() =>
              lists.map((list) => {
                this.updatingListIds.delete(list);
                this.listService.getAll(this.electionId).subscribe((retrievedLists) => {
                  this.dataSourceLists.data = this.mapToUiLists(retrievedLists);
                  this.loadLists();
                });
              })
            )
          )
          .subscribe(() => {
            this.dataSourceLists.data = this.dataSourceLists.data.filter((l) => lists.indexOf(l.id) === -1);
            lists.forEach((list) => {
              this.removeListFromUnions(list, true);
              this.removeListFromUnions(list, false);
            });
          });
      }
    });
  }

  public canUpdateListState(lists: ListModel[]): boolean {
    if (!lists || lists.length === 0 || !this.canEditLists(lists)) {
      return false;
    }

    return lists.filter((l) => l.state === ListState.Draft).length === 0;
  }

  public canValidateLists(lists: ListModel[]): boolean {
    if (!lists || lists.length === 0 || !this.canEditLists(lists)) {
      return false;
    }

    return lists.filter((l) => l.state === ListState.Valid).length === 0;
  }

  public canFormallySubmit(lists: ListModel[]): boolean {
    if (!lists || lists.length === 0 || !this.canEditLists(lists)) {
      return false;
    }

    return lists.filter((l) => l.state === ListState.FormallySubmitted).length === 0;
  }

  public formallySubmit(ids: string[]): void {
    this.updateListState(ids, ListState.FormallySubmitted);
  }

  public setValid(ids: string[]): void {
    this.updateListState(ids, ListState.Valid);
  }

  public submitLists(ids: string[]): void {
    this.updateListState(ids, ListState.Submitted);
  }

  public updateListState(ids: string[], state: ListState): void {
    const lists = ids.map((id) => {
      this.updatingListIds.add(id);
      return this.dataSourceLists.data.find((l) => l.id === id);
    });
    forkJoin(lists.map((l) => this.listService.changeState(this.election.id, l.id, state, this.theme)))
      .pipe(
        this.rxUtils.toastDefault(this.translateService.instant('LIST.MSG_SAVED')),
        finalize(() =>
          ids.map((lid) => {
            this.updatingListIds.delete(lid);
            this.listService.getAll(this.electionId).subscribe((retrievedLists) => {
              this.dataSourceLists.data = this.mapToUiLists(retrievedLists);
              this.loadLists();
            });
          })
        )
      )
      .subscribe((ls) => {
        for (const list of ls) {
          this.dataSourceLists.data[this.dataSourceLists.data.findIndex((l) => l.id === list.id)] =
            this.mapToUiList(list);
        }
        this.updateAllowedLists();
      });
  }

  public canSubmitLists(lists: ListModel[]): boolean {
    if (!lists || lists.length === 0 || !this.canEditLists(lists)) {
      return false;
    }

    return lists.filter((l) => l.state !== ListState.Draft).length === 0;
  }

  public addList(): void {
    this.router.navigate(['-', 'elections', this.election.id, 'lists', 'new']);
  }

  public createOrUpdateListUnion(listIds: string[]): void {
    listIds.forEach((id) => this.updatingListIds.add(id));
    this.listUnionService
      .createOrUpdateUnion(this.election.id, listIds)
      .pipe(
        this.rxUtils.toastDefault(this.translateService.instant('LIST.MSG_SAVED')),
        finalize(() => listIds.map((id) => this.updatingListIds.delete(id)))
      )
      .subscribe((listUnion) => {
        const affectedListIds = listUnion.lists.map((l) => l.id);
        this.dataSourceLists.data
          .filter((l) => affectedListIds.indexOf(l.id) > -1)
          .map((l) => (l.listUnion = listUnion));
      });
  }

  public removeFromListUnion(listId: string, isSubUnion: boolean): void {
    this.updatingListIds.add(listId);
    this.listUnionService
      .removeListFromUnion(this.election.id, listId, isSubUnion)
      .pipe(
        this.rxUtils.toastDefault(this.translateService.instant('LIST.MSG_SAVED')),
        finalize(() => this.updatingListIds.delete(listId))
      )
      .subscribe(() => {
        this.removeListFromUnions(listId, isSubUnion);
      });
  }

  public createSubUnion(rootList: ListModel): void {
    const listIds = this.selectedLists.map((l) => l.id);
    listIds.forEach((id) => this.updatingListIds.add(id));
    this.listUnionService
      .createOrUpdateUnion(this.election.id, listIds, rootList.id)
      .pipe(
        this.rxUtils.toastDefault(this.translateService.instant('LIST.MSG_SAVED')),
        finalize(() => listIds.map((id) => this.updatingListIds.delete(id)))
      )
      .subscribe((listUnion) => {
        const affectedListIds = listUnion.lists.map((l) => l.id);
        this.dataSourceLists.data
          .filter((l) => affectedListIds.indexOf(l.id) > -1)
          .map((l) => (l.listSubUnion = listUnion));
      });
  }

  public getListDescriptionById(id: string): string {
    const list = this.dataSourceLists.data.find((l) => l.id === id);
    if (!list) {
      return '';
    }
    return list.indenture || list.name;
  }

  public getListIds(): string[] {
    const listIds: string[] = [];
    this.selectedLists.forEach((list) => {
      listIds.push(list.id);
    });
    return listIds;
  }

  public isListInUnion(list: ListModel, subUnion: boolean): boolean {
    if (!list) {
      return false;
    }
    return subUnion ? !!list.listSubUnion : !!list.listUnion;
  }

  public canEditList(list: ListModel): boolean {
    return this.editableLists.indexOf(list) > -1;
  }

  public canEditLists(lists: ListModel[]): boolean {
    return lists.every((l) => this.canEditList(l));
  }

  public downloadDocuments(docs: DocumentModel[]): void {
    for (const doc of docs) {
      this.ballotDocService.download(this.election.id, doc.id);
    }
  }

  public newSubUnion(): void {
    let dialogRef = this.dialogService.open(ListSubunionRootComponent, {
      data: {
        lists: this.selectedLists,
      },
    });

    dialogRef.componentInstance.selectSubUnion.subscribe((list) => {
      this.createSubUnion(list);
    });
  }

  public newlistIndenture(): void {
    const dialogData: ListIndentureModifyData = {
      list: this.selectedLists[0],
      otherListIndentures: this.dataSourceLists.data
        .filter((l) => l.id !== this.selectedLists[0].id)
        .map((l) => l.indenture),
    };

    const dialogRef = this.dialogService.open(ListIndentureModifyComponent, dialogData);
    dialogRef.componentInstance.save.subscribe((list) => {
      this.updateList(list);
    });
  }

  public isSubmissionDeadlinePassed(submissionDeadlineDate: Date): boolean {
    let todayDateForCompare: Date = new Date();
    todayDateForCompare.setHours(0, 0, 0, 0);
    submissionDeadlineDate?.setHours(0, 0, 0, 0);
    return submissionDeadlineDate < todayDateForCompare;
  }

  private updateAllowedLists(): void {
    for (const list of this.dataSourceLists.data) {
      this.roleService.canEditList(list).subscribe((canEdit) => {
        if (canEdit) {
          this.editableLists.push(list);
        }
      });
    }
  }

  private removeListFromUnions(listId: string, isSubUnion: boolean): void {
    for (const l of this.dataSourceLists.data) {
      const union = isSubUnion ? l.listSubUnion : l.listUnion;
      if (!union) {
        continue;
      }

      if (union.rootListId === listId) {
        l.listSubUnion = null;
        continue;
      }

      const listIndex = union.lists.findIndex((x) => x.id === listId);
      this.removeListfromUnion(listIndex, union, l, isSubUnion);
    }

    this.removeUnionIfItStillExists(listId, isSubUnion);
  }

  private removeListfromUnion(
    listIndex: number,
    union: ListUnionModel,
    l: ListModel,
    isSubUnion: boolean
  ): void {
    if (listIndex > -1 && union.lists.length <= 2) {
      if (isSubUnion) {
        l.listSubUnion = null;
      } else {
        l.listUnion = null;
      }
    } else if (listIndex > -1) {
      union.lists.splice(listIndex, 1);
    }
  }

  private removeUnionIfItStillExists(listId: string, isSubUnion: boolean): void {
    const list = this.dataSourceLists.data.find((l) => l.id === listId);
    if (!list) {
      return;
    }

    if (isSubUnion) {
      list.listSubUnion = null;
    } else {
      list.listUnion = null;
    }
  }

  private mapToUiLists(lists: ListModel[]): UiListModel[] {
    return lists.map(this.mapToUiList);
  }

  private mapToUiList(list: ListModel): UiListModel {
    return {
      ...list,
      description: list.description ?? '',
      uiModifiedByName: list.modifiedByName || list.createdByName,
      uiModifiedDate: list.modifiedDate ? list.modifiedDate : list.creationDate,
    };
  }
}

export enum ListTableColumn {
  nr = 'nr',
  name = 'name',
  description = 'description',
  version = 'version',
  modifyDate = 'uiModifiedDate',
  modifyUser = 'uiModifiedByName',
  state = 'state',
  validated = 'validated',
  locked = 'locked',
  listUnion = 'listUnion',
  listSubUnion = 'listSubUnion',
}

export interface UiListModel extends ListModel {
  uiModifiedDate: Date;
  uiModifiedByName: string;
}
