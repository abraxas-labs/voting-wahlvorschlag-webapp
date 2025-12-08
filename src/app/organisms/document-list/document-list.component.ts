/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { DocumentModel } from '../../shared/models/document.model';
import { v4 as uuid } from 'uuid';
import {
  PaginatorComponent,
  SelectionChange,
  SortDirective,
  TableDataSource,
} from '@abraxas/base-components';
import { TableColumn } from '../domains-of-influence/domains-of-influence.component';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss'],
  standalone: false,
})
export class DocumentListComponent implements AfterViewInit {
  private changeDetect = inject(ChangeDetectorRef);

  @Input() public documents: DocumentModel[] = [];
  @Input() public download: boolean = false;
  @Input() public writeable: boolean = false;

  @Output()
  public documentsSelected: EventEmitter<DocumentModel[]> = new EventEmitter<DocumentModel[]>();

  public selectedDocuments: DocumentModel[] = [];

  @ViewChild('fileInput') private fileInput: ElementRef | undefined;
  @ViewChild('paginator') public paginator!: PaginatorComponent;
  @ViewChild('documentSort') public documentSort: SortDirective;

  public dataSource = new TableDataSource<DocumentModel>(this.documents);
  public columns = TableColumn;
  public columnsToDisplay: string[] = ['selection', TableColumn.name];

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.data = this.documents;
    this.changeDetect.detectChanges();
  }

  public downloadDocuments(docs: DocumentModel[]): void {
    this.documentsSelected.emit(docs);
  }

  public addDocument(doc: DocumentModel): void {
    doc.id = uuid();
    this.documents.push(doc);
    this.dataSource.data = this.documents;
  }

  public onSelectionChange(selection: SelectionChange<DocumentModel>): void {
    this.selectedDocuments = [];
    selection.after.forEach((element) => {
      this.selectedDocuments.push(element.value);
    });
  }
}
