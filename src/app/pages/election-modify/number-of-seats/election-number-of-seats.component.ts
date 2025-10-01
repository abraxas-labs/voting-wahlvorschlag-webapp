/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ElectionModel } from '../../../shared/models/election.model';
import { Subscription } from 'rxjs';
import { ElectionDomainOfInfluenceModel } from '../../../shared/models/election-domain-of-influence.model';

@Component({
  selector: 'app-election-number-of-seats',
  templateUrl: './election-number-of-seats.component.html',
  styleUrls: ['./election-number-of-seats.component.scss'],
  standalone: false,
})
export class ElectionNumberOfSeatsComponent implements OnDestroy, AfterViewInit {
  @Input() public election!: ElectionModel;
  @Output() public isValidChange: EventEmitter<boolean> = new EventEmitter(true);
  @Output() public seatsChanged: EventEmitter<ElectionDomainOfInfluenceModel> = new EventEmitter();
  @Output() public electionChange: EventEmitter<ElectionModel> = new EventEmitter();
  @ViewChild('numberOfSeat') private numberOfSeat: any;
  private isValid: boolean = false;
  private subscriptions: Subscription | undefined;

  public ngAfterViewInit(): void {
    this.subscriptions = this.numberOfSeat.statusChanges.subscribe((result: string) => {
      const isValid = result === 'VALID';
      if (this.isValid === isValid) {
        return;
      }
      this.isValid = isValid;
      this.isValidChange.emit(this.isValid);
    });
  }

  public ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  public modelChanged(district: ElectionDomainOfInfluenceModel): void {
    this.seatsChanged.emit(district);
  }
}
