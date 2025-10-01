/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

@Component({
  selector: 'app-step-navigation-item',
  templateUrl: './step-navigation-item.component.html',
  styleUrls: ['./step-navigation-item.component.scss'],
  standalone: false,
})
export class StepNavigationItemComponent {
  @Input() public set active(value: boolean) {
    this.activeValue = value;
    this.cssClass = this.activeValue;
  }
  @HostBinding('attr.disabled')
  @Input()
  public disabled: boolean = false;
  @HostBinding('class.step-item-active') public cssClass: boolean = false;
  public activeValue: boolean = false;

  @Input()
  public stepSelectable: boolean = false;

  @Output()
  public stepSelected: EventEmitter<void> = new EventEmitter<void>();

  public selectStep(): void {
    if (this.stepSelectable) {
      this.stepSelected.emit();
    }
  }
}
