/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, Input } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-spinner-centered',
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [
        style({ height: '0', opacity: 0 }),
        animate('200ms', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ position: 'absolute', height: '*', opacity: 1 }),
        animate('200ms', style({ height: '0', opacity: 0 })),
      ]),
    ]),
  ],
  templateUrl: './spinner-centered.component.html',
  styleUrls: ['./spinner-centered.component.scss'],
  standalone: false,
})
export class SpinnerCenteredComponent {
  @Input() public visible: boolean = false;
}
