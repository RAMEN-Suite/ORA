import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { HttpResourceRef } from '@angular/common/http';
import { filter, map, Observable, switchMap } from 'rxjs';
import { ConfigService } from '../../services/config.service';
import { ViewResponse, ViewService } from '../../services/view.service';
import { Registry } from '../../models/Registry';
import { PARAMS } from '../../app.routes';
import { BlockPathResolver } from '../../resolvers/block-path.resolver';
import { Block, DetailView, DetailViews } from '../../models/config/DetailViews';
import { Node } from '../../models/Node';

@Component({ template: '' })
export abstract class AbstractDetailScreen<TNode extends Node = Node> {
  protected readonly configService: ConfigService = inject(ConfigService);
  protected readonly viewService: ViewService = inject(ViewService);
  protected readonly route: ActivatedRoute = inject(ActivatedRoute);

  protected readonly config: Registry = this.configService.config();
  protected readonly compositionType: WritableSignal<keyof DetailViews | undefined> = signal(undefined);

  protected readonly uuid: Signal<string | null> = toSignal(
    this.route.paramMap.pipe(map((params: ParamMap): string | null => params.get(PARAMS.UUID))),
    { initialValue: null },
  );

  protected readonly queryMap: Signal<ParamMap> = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected readonly node: Signal<TNode | null> = toSignal(
    toObservable(this.uuid).pipe(
      filter((uuid: string | null): uuid is string => uuid !== null),
      switchMap((uuid: string): Observable<TNode> => this.viewService.fetchNode<TNode>(uuid)),
    ),
    { initialValue: null },
  );

  protected readonly detailView: Signal<DetailView | null> = computed((): DetailView | null => {
    const compositionType: keyof DetailViews | undefined = this.compositionType();
    const labels: string[] = this.nodeLabels();

    if (!compositionType || labels.length === 0) return null;
    return this.config.composition(compositionType, labels);
  });

  protected readonly nodeLabels: Signal<string[]> = computed((): string[] => this.node()?._labels ?? []);
  protected readonly blocks: Signal<Block[]> = computed((): Block[] => this.detailView()?.blocks ?? []);

  protected readonly accessPaths: Signal<string[]> = computed((): string[] => BlockPathResolver.resolvePaths(this.blocks()));
  protected readonly $view: HttpResourceRef<ViewResponse | undefined> = this.viewService.fetchView(this.uuid, this.accessPaths);

  protected readonly values: Signal<Record<string, unknown>> = computed(
    (): Record<string, unknown> => this.$view.value()?.values ?? {},
  );

  protected init(compositionType: keyof DetailViews): void {
    this.compositionType.set(compositionType);
  }
}
