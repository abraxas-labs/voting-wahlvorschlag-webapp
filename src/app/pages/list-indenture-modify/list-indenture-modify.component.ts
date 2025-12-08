/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { ListModel } from '../../shared/models/list.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DateUtils } from 'src/app/shared/utils/date-utils';

@Component({
  selector: 'app-list-indenture-modify',
  templateUrl: './list-indenture-modify.component.html',
  styleUrls: ['./list-indenture-modify.component.scss'],
  standalone: false,
})
export class ListIndentureModifyComponent implements OnInit {
  public readonly data = inject<ListIndentureModifyData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<ListIndentureModifyComponent>>(MatDialogRef);
  private readonly detectChanges = inject(ChangeDetectorRef);

  @Output()
  public save: EventEmitter<ListModel> = new EventEmitter<ListModel>();

  public listIndenture?: string;
  public listSubmitDate?: any;
  public otherListIndentures: string[];
  public hasDuplicateListIndenture: boolean = false;

  private _list: ListModel;

  public set list(l: ListModel) {
    this._list = l;
    if (l) {
      this.listIndenture = l.indenture;
      this.listSubmitDate = l.submitDate ? new Date(l.submitDate) : new Date();
    } else {
      this.listIndenture = undefined;
      this.listSubmitDate = new Date(Date.now());
    }
  }

  public get list(): ListModel {
    return this._list;
  }

  constructor() {
    this.list = this.data.list;
    this.otherListIndentures = this.data.otherListIndentures;
  }

  public ngOnInit(): void {
    this.updateHasDuplicateListIndenture();
    this.detectChanges.detectChanges();
  }

  public updateListIndenture(indenture?: string): void {
    this.listIndenture = indenture;
    this.updateHasDuplicateListIndenture();
  }

  public emitSave(): void {
    this._list.indenture = !!this.listIndenture ? this.listIndenture : undefined;
    this._list.submitDate = DateUtils.dateToUtcString(new Date(this.listSubmitDate)) as Date;
    this.save.emit(this._list);
    this.close();
  }

  public close(): void {
    this.dialogRef.close();
  }

  private updateHasDuplicateListIndenture(): void {
    if (!this.listIndenture) {
      this.hasDuplicateListIndenture = false;
      return;
    }

    this.hasDuplicateListIndenture = this.otherListIndentures.includes(this.listIndenture);
  }
}

export interface ListIndentureModifyData {
  list: ListModel;
  otherListIndentures: string[];
}
