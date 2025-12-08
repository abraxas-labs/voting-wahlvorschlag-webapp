/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, inject } from '@angular/core';
import { GuardService } from '../../shared/guard.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  standalone: false,
})
export class NavigationComponent {
  public isWahlverwalter$: Observable<boolean>;

  constructor() {
    const roleService = inject(GuardService);

    this.isWahlverwalter$ = roleService.isWahlverwalter();
  }
}
