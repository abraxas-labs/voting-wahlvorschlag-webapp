/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ElectionModel } from 'src/app/shared/models/election.model';
import { ListModel } from 'src/app/shared/models/list.model';

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  standalone: false,
})
export class ExportDialogComponent {
  public readonly dialogRef = inject<MatDialogRef<ExportDialogComponent>>(MatDialogRef);
  public readonly data = inject(MAT_DIALOG_DATA);

  public election: ElectionModel = null;
  public lists: ListModel[] = [];

  constructor() {
    this.election = this.data.data.election;
    this.lists = this.data.data.lists;
  }

  public close(result: boolean): void {
    this.dialogRef.close(result);
  }
}
