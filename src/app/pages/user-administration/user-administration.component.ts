/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import {
  AuthenticationService,
  DialogService,
  FilterDirective,
  PaginatorComponent,
  SortDirective,
  TableDataSource,
} from '@abraxas/base-components';
import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { PartiesService } from '../../shared/services/parties.service';
import { PartyModel } from '../../shared/models/party.model';
import { PartyUserService } from '../../shared/services/party-user.service';
import { PartyUserModel } from '../../shared/models/party-user.model';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { ModalDialogComponent } from 'src/app/shared/components/dialogs/modal-dialog/modal-dialog.component';

@Component({
  selector: 'app-user-administration',
  templateUrl: './user-administration.component.html',
  styleUrls: ['./user-administration.component.scss'],
  standalone: false,
})
export class UserAdministrationComponent implements OnInit, AfterViewInit {
  public readonly auth = inject(AuthenticationService);
  private partiesService = inject(PartiesService);
  private partyUserService = inject(PartyUserService);
  private router = inject(Router);
  private translateService = inject(TranslateService);
  private dialogService = inject(DialogService);
  private snackBarService = inject(SnackbarService);

  @ViewChild('tenantFilter') public tenantFilter: FilterDirective;
  @ViewChild('userFilter') public userFilter: FilterDirective;

  @ViewChild('tenantSort') public tenantSort: SortDirective;
  @ViewChild('userSort') public userSort: SortDirective;

  @ViewChild('tenantPaginator') public tenantPaginator: PaginatorComponent;
  @ViewChild('userPaginator') public userPaginator: PaginatorComponent;

  public tenants: PartyModel[] = [];
  public loadingTenants: boolean = false;
  public users: PartyUserModel[] = [];
  public loadingUsers: boolean = false;

  public dataSource = new TableDataSource<PartyModel>(this.tenants);
  public dataSourceUsers = new TableDataSource<PartyUserModel>(this.users);

  public columns = TableColumn;
  public columnsToDisplay: string[] = [TableColumn.name, 'actions'];

  public userColumns = UserTableColumn;
  public userColumnsToDisplay: string[] = [
    UserTableColumn.firstname,
    UserTableColumn.lastname,
    UserTableColumn.username,
    UserTableColumn.tenantDescription,
    'userActions',
  ];

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.tenantPaginator;
    this.dataSource.sort = this.tenantSort;
    this.dataSource.filter = this.tenantFilter;

    this.dataSourceUsers.paginator = this.userPaginator;
    this.dataSourceUsers.sort = this.userSort;
    this.dataSourceUsers.filter = this.userFilter;
  }

  public ngOnInit(): void {
    this.loadParties();
    this.loadUsers();
  }

  public removeParty(id: any): void {
    let dialogRef = this.dialogService.open(ModalDialogComponent, {
      data: {
        header: this.translateService.instant('DIALOG_OPTIONS.DELETE_SELECTION_HEADER'),
        text: this.translateService.instant('DIALOG_OPTIONS.DELETE_REQUEST_SELECTION_TEXT'),
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.partiesService.delete(id).subscribe({
          next: () => {
            this.snackBarService.success(this.translateService.instant('USER_ADMINISTRATION.PARTY.DELETED'));
          },
          error: () => {
            this.snackBarService.error(
              this.translateService.instant('USER_ADMINISTRATION.MSG_PARTY_DELETE_FAILED')
            );
          },
          complete: () => {
            this.loadParties();
          },
        });
      }
    });
  }

  public removeUser(element: any): void {
    let dialogRef = this.dialogService.open(ModalDialogComponent, {
      data: {
        header: this.translateService.instant('DIALOG_OPTIONS.DELETE_SELECTION_HEADER'),
        text: this.translateService.instant('DIALOG_OPTIONS.DELETE_SELECTION_TEXT'),
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.partyUserService.delete(element.loginid).subscribe({
          next: () => {
            this.loadUsers();
            this.snackBarService.success(this.translateService.instant('USER_ADMINISTRATION.USER.DELETED'));
          },
          error: () => {
            this.snackBarService.error(
              this.translateService.instant('USER_ADMINISTRATION.MSG_USER_DELETE_FAILED')
            );
          },
          complete: () => {
            this.loadUsers();
          },
        });
      }
    });
  }

  public editUser(event: any): void {
    event.cancel = true;
    this.router.navigate(['-', 'administration', 'users', event.loginid]);
  }

  private loadUsers(): void {
    this.loadingUsers = true;
    this.partyUserService.getAll().subscribe({
      next: (users) => {
        this.users = users;
        this.dataSourceUsers.data = this.users;
      },
      error: () => {},
      complete: () => {
        this.loadingUsers = false;
      },
    });
  }

  private loadParties(): void {
    this.loadingTenants = true;
    this.partiesService.getAll().subscribe({
      next: (tenants) => {
        this.tenants = tenants;
        this.dataSource.data = tenants;
      },
      error: () => {},
      complete: () => {
        this.loadingTenants = false;
      },
    });
  }
}
export enum TableColumn {
  name = 'name',
}

export enum UserTableColumn {
  firstname = 'firstname',
  lastname = 'lastname',
  username = 'username',
  tenantDescription = 'tenantDescription',
}
