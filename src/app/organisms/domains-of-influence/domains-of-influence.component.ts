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
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';
import { ModalDialogComponent } from 'src/app/shared/components/dialogs/modal-dialog/modal-dialog.component';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { DomainOfInfluenceModel, DomainOfInfluenceType } from '../../shared/models/domainOfInfluence.model';
import { ElectoralDistrictService } from '../../shared/services/electoral-district.service';

@Component({
  selector: 'app-domains-of-influence',
  templateUrl: './domains-of-influence.component.html',
  styleUrls: ['./domains-of-influence.component.scss'],
  standalone: false,
})
export class DomainsOfInfluenceComponent implements OnInit {
  @ViewChild(PaginatorComponent)
  public paginator!: PaginatorComponent;

  @ViewChild(SortDirective)
  public sort!: SortDirective;

  @Input() public allowUpdating: boolean = false;
  @Input() public allowDeleting: boolean = false;

  public districts: DomainOfInfluenceModel[] = [];
  public types: any[] = Object.keys(DomainOfInfluenceType);
  public selectedDomains: DomainOfInfluenceModel[] = [];
  public loadingDomains: boolean = false;

  public dataSource = new TableDataSource<DomainOfInfluenceModel>(this.districts);

  public columns = TableColumn;
  public columnsToDisplay: string[] = [
    'selection',
    TableColumn.officialId,
    TableColumn.name,
    TableColumn.shortName,
    TableColumn.domainOfInfluenceType,
    'actions',
  ];

  constructor(
    private electoralDistrictService: ElectoralDistrictService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    this.loadDistricts();
  }

  public onSelectionChange(selection: SelectionChange<DomainOfInfluenceModel>): void {
    this.selectedDomains = [];
    selection.after.forEach((e) => {
      this.selectedDomains.push(e.value);
    });
  }

  public deleteSelectedRows(): void {
    let dialogRef = this.dialogService.open(ModalDialogComponent, {
      data: {
        header: this.translateService.instant('DIALOG_OPTIONS.DELETE_SELECTION_HEADER'),
        text: this.translateService.instant('DIALOG_OPTIONS.DELETE_SELECTION_TEXT'),
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.selectedDomains.forEach((e) => {
          this.electoralDistrictService.delete(e.id).subscribe({
            next: () => {
              this.loadingDomains = true;
              this.snackbarService.success(this.translateService.instant('DOMAIN_OF_INFLUENCE.MSG_DELETED'));
              this.loadDistricts();
            },
            error: () => {
              this.snackbarService.error(
                this.translateService.instant('DOMAIN_OF_INFLUENCE.MSG_DELETED_FAILED')
              );
            },
            complete: () => {
              this.loadingDomains = false;
            },
          });
        });
      }
    });
  }

  public onDelete(id: any): void {
    this.electoralDistrictService.delete(id).subscribe({
      next: () => {
        this.loadingDomains = true;
        this.snackbarService.success(this.translateService.instant('DOMAIN_OF_INFLUENCE.MSG_DELETED'));
        this.loadDistricts();
      },
      error: () => {
        this.snackbarService.error(this.translateService.instant('DOMAIN_OF_INFLUENCE.MSG_DELETED_FAILED'));
      },
      complete: () => {
        this.loadingDomains = false;
      },
    });
  }

  public onOpenEditPage(event: any): void {
    this.router.navigate(['modify', event], {
      relativeTo: this.activatedRoute,
    });
  }

  private loadDistricts(): void {
    this.loadingDomains = true;
    this.electoralDistrictService
      .getAll()
      .pipe(finalize(() => (this.loadingDomains = false)))
      .subscribe((districts) => {
        this.dataSource.data = districts;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
  }
}

export enum TableColumn {
  officialId = 'officialId',
  name = 'name',
  shortName = 'shortName',
  domainOfInfluenceType = 'domainOfInfluenceType',
}
