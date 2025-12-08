/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, EventEmitter, Output, inject } from '@angular/core';
import { ListModel } from '../../shared/models/list.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-list-subunion-root',
  templateUrl: './list-subunion-root.component.html',
  styleUrls: ['./list-subunion-root.component.scss'],
  standalone: false,
})
export class ListSubunionRootComponent {
  public readonly data = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<ListSubunionRootComponent>>(MatDialogRef);

  public lists: ListModel[];

  @Output()
  public selectSubUnion: EventEmitter<ListModel> = new EventEmitter<ListModel>();

  public selectedList: ListModel;

  constructor() {
    this.lists = this.data.data.lists;
  }

  public emitSelect(): void {
    this.selectSubUnion.emit(this.selectedList);
    this.close();
  }

  public close(): void {
    this.dialogRef.close();
  }
}
