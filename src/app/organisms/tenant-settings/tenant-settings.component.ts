/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, OnInit, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, of, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { InfoTextKeys, InfoTextModel } from '../../shared/models/info-text.model';
import { SettingsModel } from '../../shared/models/settings.model';
import { InfoTextService } from '../../shared/services/info-text.service';
import { RxJsUtilsService } from '../../shared/services/rx-js-utils.service';
import { SettingsService } from '../../shared/services/settings.service';

@Component({
  selector: 'app-tenant-settings',
  templateUrl: './tenant-settings.component.html',
  styleUrls: ['./tenant-settings.component.scss'],
  standalone: false,
})
export class TenantSettingsComponent implements OnInit {
  private infoTextService = inject(InfoTextService);
  private settingsService = inject(SettingsService);
  private rxUtils = inject(RxJsUtilsService);
  private translateService = inject(TranslateService);

  public settings: SettingsModel;
  public infotextTenantTitle: InfoTextModel;

  public loading: boolean = true;
  public saving: boolean = false;

  public ngOnInit(): void {
    const infoText$ = this.infoTextService.get(InfoTextKeys.TENANT_TITLE).pipe(
      catchError((err) => {
        if (err.status === 404) {
          return of({
            key: InfoTextKeys.TENANT_TITLE,
            value: '',
            visible: true,
          });
        }

        return throwError(err);
      })
    );

    const settings$ = this.settingsService.get();

    forkJoin(infoText$, settings$)
      .pipe(
        this.rxUtils.toastDefault(),
        finalize(() => (this.loading = false))
      )
      .subscribe(([txt, tSettings]) => {
        this.infotextTenantTitle = txt;
        this.settings = tSettings;
      });
  }

  public saveChanges(): void {
    this.saving = true;

    const infoText$ = this.infoTextService.set(this.infotextTenantTitle);
    const settings$ = this.settingsService.update({
      tenantLogo: this.settings.tenantLogo,
      wabstiExportTenantTitle: this.settings.wabstiExportTenantTitle,
    });

    forkJoin(infoText$, settings$)
      .pipe(
        this.rxUtils.toastDefault(this.translateService.instant('SAVED')),
        finalize(() => (this.saving = false))
      )
      .subscribe(([txt]) => (this.infotextTenantTitle = txt));
  }
}
