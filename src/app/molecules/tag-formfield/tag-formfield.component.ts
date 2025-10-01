/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-tag-formfield',
  templateUrl: './tag-formfield.component.html',
  styleUrls: ['./tag-formfield.component.scss'],
  standalone: false,
})
export class TagFormfieldComponent {
  @Input() public visible: boolean = true;
  @Input() public tagged: boolean = true;
  @Output() public taggedChange: EventEmitter<boolean> = new EventEmitter();

  public tagClick(): void {
    this.tagged = !this.tagged;
    this.taggedChange.emit(this.tagged);
  }
}
