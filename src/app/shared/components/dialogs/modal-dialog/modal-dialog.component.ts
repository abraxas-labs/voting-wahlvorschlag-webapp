/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  standalone: false,
})
export class ModalDialogComponent {
  public header: string;
  public text: string;

  constructor(
    public readonly dialogRef: MatDialogRef<ModalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dialogRef.disableClose = true;
    this.header = data.data.header;
    this.text = data.data.text;
  }

  public close(result: boolean): void {
    this.dialogRef.close(result);
  }
}
