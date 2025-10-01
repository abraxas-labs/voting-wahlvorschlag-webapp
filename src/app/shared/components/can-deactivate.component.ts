/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, HostListener } from '@angular/core';

@Component({
  template: '',
  standalone: false,
})
export abstract class CanDeactivateComponent {
  public abstract canDeactivate(): boolean;

  @HostListener('window:beforeunload', ['$event'])
  public unloadNotification($event: any): void {
    if (!this.canDeactivate()) {
      $event.returnValue = true;
    }
  }
}
