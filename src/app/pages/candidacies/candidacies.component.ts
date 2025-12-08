/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, OnInit, inject } from '@angular/core';
import { CanDeactivateComponent } from 'src/app/shared/components/can-deactivate.component';
import { Breadcrumb } from 'src/app/molecules/breadcrumbs/breadcrumbs.component';
import { ActivatedRoute } from '@angular/router';
import { ElectionService } from 'src/app/shared/services/election.service';
import { ListService } from 'src/app/shared/services/list.service';
import { forkJoin } from 'rxjs';
import { CachedUserService } from '../../shared/services/cached-user.service';
import { RxJsUtilsService } from '../../shared/services/rx-js-utils.service';
import { ElectionModel } from 'src/app/shared/models/election.model';
import { ListModel } from 'src/app/shared/models/list.model';

@Component({
  selector: 'app-candidacies',
  templateUrl: './candidacies.component.html',
  styleUrls: ['./candidacies.component.scss'],
  standalone: false,
})
export class CandidaciesComponent extends CanDeactivateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private electionService = inject(ElectionService);
  private listService = inject(ListService);
  private cachedUserService = inject(CachedUserService);
  private rxUtils = inject(RxJsUtilsService);

  public breadcrumbs: Breadcrumb[] = [];
  public hasChanges: boolean = false;
  public electionId: string = '';
  public listId: string = '';
  public hasActiveTenant: boolean = false;
  public election: ElectionModel;
  public list: ListModel;
  public loading: boolean = true;

  public ngOnInit(): void {
    this.electionId = this.route.snapshot.params.electionId;
    this.listId = this.route.snapshot.params.listId;
    this.loading = true;

    this.cachedUserService
      .getActiveTenant()
      .pipe(this.rxUtils.toastDefault())
      .subscribe(() => {
        this.hasActiveTenant = true;
        forkJoin(
          this.electionService.get(this.electionId),
          this.listService.get(this.electionId, this.listId)
        ).subscribe((e) => {
          this.election = e[0];
          this.list = e[1];
          this.loading = false;
          this.breadcrumbs = [
            {
              text: e[0].name,
              route: `/-/elections/${encodeURIComponent(this.electionId)}`,
            },
            {
              text: e[1].name + (e[1].description ? ' ' + e[1].description : ''),
              route: `/-/elections/${encodeURIComponent(this.electionId)}/lists/${encodeURIComponent(this.listId)}`,
            },
          ];
        });
      });
  }

  public canDeactivate(): boolean {
    return !this.hasChanges;
  }
}
