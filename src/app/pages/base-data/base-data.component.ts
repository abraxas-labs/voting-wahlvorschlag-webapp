/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { AuthenticationService } from '@abraxas/base-components';
import { Component } from '@angular/core';

@Component({
  selector: 'app-base-data',
  templateUrl: './base-data.component.html',
  styleUrls: ['./base-data.component.scss'],
  standalone: false,
})
export class BaseDataComponent {
  constructor(public auth: AuthenticationService) {}
}
