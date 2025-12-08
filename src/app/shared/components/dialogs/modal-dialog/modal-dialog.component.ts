/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  standalone: false,
})
export class ModalDialogComponent {
  public readonly dialogRef = inject<MatDialogRef<ModalDialogComponent>>(MatDialogRef);
  public readonly data = inject(MAT_DIALOG_DATA);

  public header: string;
  public text: string;

  constructor() {
    this.dialogRef.disableClose = true;
    this.header = this.data.data.header;
    this.text = this.data.data.text;
  }

  public close(result: boolean): void {
    this.dialogRef.close(result);
  }
}
