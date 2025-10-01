/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Injectable } from '@angular/core';

import { CanDeactivateComponent } from './components/can-deactivate.component';
import { Observable, of } from 'rxjs';
import { DialogService } from '@abraxas/base-components';
import { ModalDialogComponent } from './components/dialogs/modal-dialog/modal-dialog.component';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class CanDeactivateGuard {
  constructor(
    private dialogService: DialogService,
    private translateService: TranslateService
  ) {}

  public canDeactivate(component: CanDeactivateComponent): Observable<boolean> {
    if (!component.canDeactivate()) {
      let dialogRef = this.dialogService.open(ModalDialogComponent, {
        data: {
          header: this.translateService.instant('DIALOG_OPTIONS.LEAVE_WITHOUT_SAVE_HEADER'),
          text: this.translateService.instant('DIALOG_OPTIONS.LEAVE_WITHOUT_SAVE_TEXT'),
        },
      });

      return dialogRef.afterClosed();
    } else {
      return of(true);
    }
  }
}
