/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, OnInit, inject } from '@angular/core';
import { PartiesService } from '../../../shared/services/parties.service';
import { RxJsUtilsService } from '../../../shared/services/rx-js-utils.service';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { PartyUserService } from '../../../shared/services/party-user.service';
import { newUser, PartyUserModel } from '../../../shared/models/party-user.model';
import { PartyModel } from '../../../shared/models/party.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-modify',
  templateUrl: './user-modify.component.html',
  styleUrls: ['./user-modify.component.scss'],
  standalone: false,
})
export class UserModifyComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private partiesService = inject(PartiesService);
  private partyUserService = inject(PartyUserService);
  private rxUtils = inject(RxJsUtilsService);
  private router = inject(Router);
  private translateService = inject(TranslateService);

  public saving: boolean = false;
  public loading: boolean = false;
  public user: PartyUserModel = newUser();
  public parties: PartyModel[] = [];
  private newTenants: PartyModel[] = [];

  constructor() {
    this.partiesService
      .getAll()
      .pipe(this.rxUtils.toastDefault())
      .subscribe((parties) => {
        this.parties = parties;
      });
  }

  public ngOnInit(): void {
    const userLoginId: string = this.activatedRoute.snapshot.params.userId;
    if (userLoginId && userLoginId.length > 0) {
      this.loading = true;
      this.partyUserService
        .get(userLoginId)
        .pipe(
          this.rxUtils.toastDefault(),
          finalize(() => (this.loading = false))
        )
        .subscribe((u) => {
          this.user = u;
        });
    }
  }

  public fillTenants(tenants: any): void {
    const idSet = new Set(tenants);
    this.newTenants = this.parties.filter((item) => idSet.has(item.id));
  }

  public save(): void {
    this.saving = true;
    this.user.tenants = this.newTenants;
    const ov = this.isNew ? this.partyUserService.create(this.user) : this.partyUserService.update(this.user);
    ov.pipe(
      this.rxUtils.toastDefault(this.translateService.instant('USER_ADMINISTRATION.USER.SAVED')),
      finalize(() => (this.saving = false))
    ).subscribe(() => this.router.navigate(['-', 'administration', 'permissions']));
  }

  public get isNew(): boolean {
    return !this.user.id;
  }

  public isUserFormValid(): boolean {
    return this.isNew ? this.isNewUserValid() : this.isExistingUserValid();
  }

  private isNewUserValid(): boolean {
    return this.hasValidName() && this.hasValidUsername() && this.hasValidEmail() && this.hasTenants();
  }

  private isExistingUserValid(): boolean {
    return this.hasValidName();
  }

  private hasValidName(): boolean {
    return (
      this.user.firstname &&
      this.user.firstname.length > 0 &&
      this.user.lastname &&
      this.user.lastname.length > 0
    );
  }

  private hasValidUsername(): boolean {
    return this.user.username && this.user.username.length > 0;
  }

  private hasValidEmail(): boolean {
    return this.user.email && this.user.email.length > 0 && this.user.email.indexOf('@') > -1;
  }

  private hasTenants(): boolean {
    return this.newTenants && this.newTenants.length > 0;
  }
}
