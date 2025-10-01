/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { DialogService } from '@abraxas/base-components';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ModalDialogComponent } from 'src/app/shared/components/dialogs/modal-dialog/modal-dialog.component';

@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  standalone: false,
})
export class MultiSelectComponent {
  @Input()
  public set items(value: any[]) {
    this.itemValue = value;
    this.applySelectedIds();
    this.filterSelection();
  }

  public get items(): any[] {
    return this.itemValue;
  }

  @Input()
  public set selectedItems(value: any[]) {
    this.selectedItemsValue = value;
    this.filterSelection();
  }

  public get selectedItems(): any[] {
    return this.selectedItemsValue;
  }

  @Input()
  public set selectedIds(ids: any[]) {
    this.selectedIdsValue = ids;
    this.applySelectedIds();
  }

  public get selectedIds(): any[] {
    return this.selectedItems.map((i) => i[this.idExpr] || i);
  }

  @Input()
  public set idExpr(v: string) {
    this.idExprValue = v;
    this.applySelectedIds();
  }

  public get idExpr(): string {
    return this.idExprValue;
  }

  @Input() public title: string | undefined;
  @Input() public gridTitle: string | undefined;
  @Input() public displayExpr: string = '';
  @Input() public maxItems: number | undefined = undefined;
  @Output() public added: EventEmitter<any> = new EventEmitter();
  @Output() public deleted: EventEmitter<any> = new EventEmitter<any>();
  @Output() public selectedItemsChange: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() public selectedIdsChange: EventEmitter<any[]> = new EventEmitter<any[]>();
  public selectedItem: any;
  public filteredItems: any;
  public selectedItemsValue: any[] = [];
  private itemValue: any[] = [];
  private selectedIdsValue?: any[];
  private idExprValue: string = '';

  constructor(
    private translateService: TranslateService,
    private dialogService: DialogService
  ) {}

  public addSelection(item: any): void {
    if (!item) {
      return;
    }
    this.selectedItemsValue.push(item);
    this.added.emit(item);
    this.selectedItemsChange.emit(this.selectedItemsValue);
    this.selectedIdsChange.emit(this.selectedIds);
    this.filterSelection();
    this.selectedItem = undefined;
  }

  public async deleteSelection(deleteItem: any): Promise<void> {
    if (!this.selectedItemsValue || this.selectedItemsValue.length < 1) {
      return;
    }
    let dialogRef = this.dialogService.open(ModalDialogComponent, {
      data: {
        header: this.translateService.instant('DIALOG_OPTIONS.DELETE_SELECTION_HEADER'),
        text: this.translateService.instant('DIALOG_OPTIONS.DELETE_SELECTION_TEXT'),
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      } else {
        const selectedIndex = this.selectedItemsValue.findIndex((item: string) => item === deleteItem);

        if (selectedIndex !== -1) {
          this.selectedItemsValue.splice(selectedIndex, 1);
        }
        this.deleted.emit(deleteItem);
        this.selectedItemsChange.emit(this.selectedItemsValue);
        this.selectedIdsChange.emit(this.selectedIds);
        this.filterSelection();
      }
    });
  }

  public resetSelection(): void {
    this.selectedItemsValue = [];
    this.selectedItemsChange.emit(this.selectedItemsValue);
    this.selectedIdsChange.emit(this.selectedIds);
    this.filterSelection();
  }

  public filterSelection(): any {
    if (!this.items) {
      return [];
    }
    if (!this.selectedItemsValue || this.selectedItemsValue.length === 0) {
      this.selectedItemsValue = [];
      this.filteredItems = this.items;
      return;
    }
    this.filteredItems = this.items.filter(
      (item: any) =>
        !this.selectedItemsValue.find(
          (selectedItem: any) =>
            (item[this.idExpr || this.displayExpr] || item) ===
            (selectedItem[this.idExpr || this.displayExpr] || selectedItem)
        )
    );
  }

  private applySelectedIds(): void {
    if (!this.selectedIdsValue || !this.items) {
      return;
    }

    this.selectedItems = this.items.filter((i) => this.selectedIdsValue.indexOf(i[this.idExpr] || i) !== -1);
  }
}
