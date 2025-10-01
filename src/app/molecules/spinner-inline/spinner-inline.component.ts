/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, Input } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-spinner-inline',
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [
        style({ width: 0, opacity: 0 }),
        animate('150ms', style({ width: 'auto', opacity: 1 })),
      ]),
      transition(':leave', [style({ opacity: 1 }), animate('150ms', style({ width: 0, opacity: 0 }))]),
    ]),
  ],
  templateUrl: './spinner-inline.component.html',
  styleUrls: ['./spinner-inline.component.scss'],
  standalone: false,
})
export class SpinnerInlineComponent {
  @Input() public visible: boolean = false;
}
