/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, Inject, EventEmitter, Output } from '@angular/core';
import { ListModel } from '../../shared/models/list.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-list-subunion-root',
  templateUrl: './list-subunion-root.component.html',
  styleUrls: ['./list-subunion-root.component.scss'],
  standalone: false,
})
export class ListSubunionRootComponent {
  public lists: ListModel[];

  @Output()
  public selectSubUnion: EventEmitter<ListModel> = new EventEmitter<ListModel>();

  public selectedList: ListModel;

  constructor(
    private readonly dialogRef: MatDialogRef<ListSubunionRootComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.lists = data.data.lists;
  }

  public emitSelect(): void {
    this.selectSubUnion.emit(this.selectedList);
    this.close();
  }

  public close(): void {
    this.dialogRef.close();
  }
}
