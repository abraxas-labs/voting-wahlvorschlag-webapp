/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepNavigationItemComponent } from './step-navigation-item/step-navigation-item.component';
import { StepNavigationComponent } from './step-navigation.component';

@NgModule({
  imports: [CommonModule],
  declarations: [StepNavigationComponent, StepNavigationItemComponent],
  exports: [StepNavigationComponent, StepNavigationItemComponent],
})
export class AppStepNavigationModule {}
