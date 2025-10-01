/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import {
  DomainOfInfluenceModel,
  DomainOfInfluenceType,
  NewDomainOfInfluence,
} from 'src/app/shared/models/domainOfInfluence.model';
import { ElectoralDistrictService } from 'src/app/shared/services/electoral-district.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';

@Component({
  selector: 'app-modify-domains-of-influence',
  templateUrl: './modify-domains-of-influence.component.html',
  styleUrls: ['./modify-domains-of-influence.component.scss'],
  standalone: false,
})
export class ModifyDomainsOfInfluenceComponent implements OnDestroy {
  private isNew: boolean;

  public loading: boolean = false;
  public domain: DomainOfInfluenceModel;
  public types: any[] = Object.keys(DomainOfInfluenceType);
  public routeSubscription: Subscription;

  constructor(
    private electoralDistrictService: ElectoralDistrictService,
    private snackBarService: SnackbarService,
    private translateService: TranslateService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.routeSubscription = this.activatedRoute.params.subscribe((p) => this.loadData(p.doiId));
  }

  public ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  public save(): void {
    if (this.isNew) {
      this.electoralDistrictService.create(this.domain).subscribe({
        next: () => {
          this.snackBarService.success(this.translateService.instant('SAVED'));
          this.router.navigate([`../`], {
            relativeTo: this.activatedRoute,
          });
        },
        error: () => {
          this.snackBarService.error(this.translateService.instant('SAVED_FAILED'));
        },
      });
      return;
    }

    this.electoralDistrictService.update(this.domain).subscribe({
      next: () => {
        this.snackBarService.success(this.translateService.instant('SAVED'));
        this.router.navigate([`../../`], {
          relativeTo: this.activatedRoute,
        });
      },
      error: () => {
        this.snackBarService.error(this.translateService.instant('SAVED_FAILED'));
      },
    });
  }

  public async loadData(id?: string): Promise<void> {
    if (!id) {
      this.isNew = true;
      this.domain = NewDomainOfInfluence();
      return;
    }

    this.isNew = false;
    this.electoralDistrictService.get(id).subscribe({
      next: (data) => {
        this.domain = data;
      },
      error: () => {
        this.snackBarService.error(this.translateService.instant('MSG_LOADING_FAILED'));
      },
    });
  }
}
