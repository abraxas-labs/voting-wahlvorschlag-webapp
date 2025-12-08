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
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnInit,
  AfterViewInit,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDialogComponent } from 'src/app/shared/components/dialogs/modal-dialog/modal-dialog.component';
import { ElectionOverviewModel } from '../../shared/models/election.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-election-list',
  templateUrl: './election-list.component.html',
  styleUrls: ['./election-list.component.scss'],
  standalone: false,
})
export class ElectionListComponent implements OnInit, AfterViewInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly dialogService = inject(DialogService);
  private readonly translateService = inject(TranslateService);

  @Input() public elections: ElectionOverviewModel[] = [];
  @Input() public allowUpdating: boolean = false;
  @Input() public allowDeleting: boolean = false;
  @Input() public showPaginator: boolean = false;
  @Input() public showDaysRemaining: boolean = false;
  @Input() public showAvailableFrom: boolean = false;
  @Input() public isArchive: boolean = false;
  @Output() public editEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() public deleteEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() public clickEvent: EventEmitter<any> = new EventEmitter<any>();

  public dataSource = new TableDataSource<ElectionOverviewModel>(this.elections);

  @ViewChild(PaginatorComponent) paginator: PaginatorComponent;
  @ViewChild(SortDirective) sort: SortDirective;
  @ViewChild(FilterDirective, { static: true }) public filter!: FilterDirective;

  public columns = TableColumn;
  public columnsToDisplay: string[] = [
    TableColumn.name,
    TableColumn.submissionDeadlineBegin,
    TableColumn.submissionDeadlineEnd,
    TableColumn.availableFrom,
    TableColumn.submissionDeadlineDiff,
    'actions',
  ];

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filter = this.filter;
  }

  public ngOnInit(): void {
    if (!this.showAvailableFrom) {
      this.columnsToDisplay.splice(this.columnsToDisplay.indexOf(TableColumn.availableFrom), 1);
    }
    if (!this.showDaysRemaining) {
      this.columnsToDisplay.splice(this.columnsToDisplay.indexOf(TableColumn.submissionDeadlineDiff), 1);
    }

    this.dataSource.data = this.elections;
  }

  public onOpenEditPage(id: string): void {
    this.router.navigate(['../../elections', id, 'modify'], {
      relativeTo: this.activatedRoute,
    });
  }

  public onDelete(election: ElectionOverviewModel): void {
    let dialogRef = this.dialogService.open(ModalDialogComponent, {
      data: {
        header: this.translateService.instant('DIALOG_OPTIONS.DELETE_SELECTION_HEADER'),
        text: this.translateService.instant('DIALOG_OPTIONS.DELETE_SELECTION_TEXT'),
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      } else {
        this.deleteEvent.emit(election);
      }
    });
  }

  public onOpenDetail(id: string): void {
    this.router.navigate(['../../elections', id], {
      relativeTo: this.activatedRoute,
    });
  }
}

export enum TableColumn {
  name = 'name',
  submissionDeadlineBegin = 'submissionDeadlineBegin',
  submissionDeadlineEnd = 'submissionDeadlineEnd',
  availableFrom = 'availableFrom',
  submissionDeadlineDiff = 'submissionDeadlineDiff',
}
