import { Component, computed, inject, Signal } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { HttpResourceRef } from '@angular/common/http';
import { filter, map, Observable, switchMap } from 'rxjs';
import { ConfigService } from '../../../services/config-service/config.service';
import { ViewResponse, ViewService } from '../../../services/view.service';
import { ConfigRegistry } from '../../../services/config-service/config.registry';
import { Collection } from '../../../models/Node';
import { PARAMS } from '../../../app.routes';
import { BlockPathResolver } from '../../../resolvers/block-path.resolver';
import { ProgressSpinner } from 'primeng/progressspinner';
import { BlockRendererComponent } from '../../shared/block-renderer/block-renderer.component';
import { Block, DetailView } from '../../../models/config/DetailViews';

@Component({
  selector: 'screen-collection',
  imports: [ProgressSpinner, BlockRendererComponent],
  templateUrl: './collection.screen.html',
})
export class CollectionScreen {
  private readonly configService: ConfigService = inject(ConfigService);
  private readonly viewService: ViewService = inject(ViewService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  private readonly config: ConfigRegistry = this.configService.config();

  protected readonly uuid: Signal<string | null> = toSignal(
    this.route.paramMap.pipe(map((params: ParamMap): string | null => params.get(PARAMS.UUID))),
    { initialValue: null },
  );
  protected readonly queryMap: Signal<ParamMap> = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected readonly collection: Signal<Collection | null> = toSignal(
    toObservable(this.uuid).pipe(
      filter((uuid: string | null): uuid is string => uuid !== null),
      switchMap((uuid: string): Observable<Collection> => this.viewService.fetchNode(uuid)),
    ),
    { initialValue: null },
  );

  protected readonly collectionView: Signal<DetailView | null> = computed((): DetailView | null => {
    const labels: string[] = this.labels();
    if (labels.length === 0) return null;
    return this.config.composition('collection', labels);
  });

  protected readonly labels: Signal<string[]> = computed((): string[] => this.collection()?._labels ?? []);
  protected readonly blocks: Signal<Block[]> = computed((): Block[] => this.collectionView()?.blocks ?? []);

  protected readonly accessPaths: Signal<string[]> = computed((): string[] => BlockPathResolver.resolvePaths(this.blocks()));
  protected readonly $view: HttpResourceRef<ViewResponse | undefined> = this.viewService.fetchView(this.uuid, this.accessPaths);

  protected readonly values: Signal<Record<string, unknown>> = computed((): Record<string, unknown> => {
    return this.$view.value()?.values ?? {};
  });
}
