/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { v4 as uuid } from 'uuid';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-info-tooltip',
  templateUrl: './info-tooltip.component.html',
  styleUrls: ['./info-tooltip.component.scss'],
  standalone: false,
})
export class InfoTooltipComponent {
  public id: string = '';
  public visible: boolean = false;
  @Input() public text: string;

  constructor() {
    this.id = `tt-${uuid()}`;
  }

  public toggleTooltip(): void {
    this.visible = !this.visible;
  }

  public setTooltip(status: boolean): void {
    this.visible = status;
  }
}
