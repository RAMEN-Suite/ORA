import { Component, computed, inject, Signal } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { HttpResourceRef } from '@angular/common/http';
import { filter, map, Observable, switchMap } from 'rxjs';
import { ConfigService } from '../../../services/config.service';
import { ViewResponse, ViewService } from '../../../services/view.service';
import { Registry } from '../../../models/Registry';
import { Collection } from '../../../models/Node';
import { PARAMS } from '../../../app.routes';
import { BlockPathResolver } from '../../../resolvers/block-path.resolver';
import { HeadlineBlock } from '../../blocks/headline-block/headline.block';
import { MetadataBlock } from '../../blocks/metadata-block/metadata.block';
import { TextBlock } from '../../blocks/text-block/text.block';
import { Block } from '../../../models/config/Block';
import { DetailScreen } from '../../../models/config/Config';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'screen-collection',
  imports: [HeadlineBlock, MetadataBlock, TextBlock, ProgressSpinner],
  templateUrl: './collection.screen.html',
})
export class CollectionScreen {
  private readonly configService: ConfigService = inject(ConfigService);
  private readonly viewService: ViewService = inject(ViewService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  private readonly config: Registry = this.configService.config();

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

  protected readonly collectionView: Signal<DetailScreen | null> = computed((): DetailScreen | null => {
    const labels: string[] = this.labels();
    if (labels.length === 0) return null;
    return this.config.composed('collection', labels);
  });

  protected readonly labels: Signal<string[]> = computed((): string[] => this.collection()?._labels ?? []);
  protected readonly blocks: Signal<Block[]> = computed((): Block[] => this.collectionView()?.blocks ?? []);

  protected readonly accessPaths: Signal<string[]> = computed((): string[] => BlockPathResolver.resolve(this.blocks()));
  protected readonly $view: HttpResourceRef<ViewResponse | undefined> = this.viewService.fetchView(this.uuid, this.accessPaths);

  protected readonly values: Signal<Record<string, unknown>> = computed((): Record<string, unknown> => {
    return this.$view.value()?.values ?? {};
  });
}
