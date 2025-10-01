/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, Input } from '@angular/core';

export interface Breadcrumb {
  text: string;
  route?: string;
}

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  standalone: false,
})
export class BreadcrumbsComponent {
  @Input() public breadcrumbs: Breadcrumb[] = [];
}
