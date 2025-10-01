/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ElectionModel } from 'src/app/shared/models/election.model';
import { ListModel } from 'src/app/shared/models/list.model';

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  standalone: false,
})
export class ExportDialogComponent {
  public election: ElectionModel = null;
  public lists: ListModel[] = [];

  constructor(
    public readonly dialogRef: MatDialogRef<ExportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.election = data.data.election;
    this.lists = data.data.lists;
  }

  public close(result: boolean): void {
    this.dialogRef.close(result);
  }
}
