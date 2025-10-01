/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, OnInit } from '@angular/core';
import { PartiesService } from '../../../shared/services/parties.service';
import { RxJsUtilsService } from '../../../shared/services/rx-js-utils.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { newParty, PartyModel } from '../../../shared/models/party.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-party-modify',
  templateUrl: './party-modify.component.html',
  styleUrls: ['./party-modify.component.scss'],
  standalone: false,
})
export class PartyModifyComponent {
  public party: PartyModel = newParty();
  public saving: boolean = false;

  constructor(
    private partiesService: PartiesService,
    private rxUtils: RxJsUtilsService,
    private router: Router,
    private translateService: TranslateService
  ) {}

  public save(): void {
    this.saving = true;
    const ov = this.partiesService.create(this.party.name);

    ov.pipe(
      this.rxUtils.toastDefault(this.translateService.instant('USER_ADMINISTRATION.PARTY.SAVED')),
      finalize(() => (this.saving = false))
    ).subscribe(() => this.router.navigate(['-', 'administration', 'permissions']));
  }
}
