/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DocumentModel } from '../../shared/models/document.model';

@Component({
  selector: 'app-filepicker',
  templateUrl: './filepicker.component.html',
  styleUrls: ['./filepicker.component.scss'],
  standalone: false,
})
export class FilepickerComponent {
  @Input()
  public multiple: boolean = true;

  @Input()
  public addIcon: string = 'file';

  @Input()
  public addTitle: string = 'ADD_DOCUMENT';

  @Input()
  public accept: string | undefined;

  @Output()
  public filePicked: EventEmitter<DocumentModel> = new EventEmitter<DocumentModel>();

  @ViewChild('fileInput')
  private fileInput: ElementRef;

  public show(): void {
    if (!this.fileInput) {
      return;
    }

    this.fileInput.nativeElement.click();
  }

  public addFile(event: any): void {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.readAsDataURL(files[i]);
      reader.onload = () =>
        this.filePicked.emit({
          name: files[i].name,
          document: String(reader.result).split(',')[1], // remove MimeType, which FileReader prepends
        });
    }
  }
}
