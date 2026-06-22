import { computed, effect, inject, Signal, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse, HttpResourceRef } from '@angular/common/http';
import { catchError, EMPTY, filter, map, Observable, switchMap } from 'rxjs';
import { ConfigService } from '../../services/config.service';
import { ViewResponse, ViewService } from '../../services/view.service';
import { Registry } from '../../helper/Registry';
import { BlockPathResolver } from '../../resolvers/block-path.resolver';
import { Block, DetailView, DetailViews } from '../../models/config/DetailViews';
import { Collection, Entity } from '../../models/Node';
import { NavigationService } from '../../services/navigation.service';
import { PARAMS, REASONS } from '../../app.routes';
import { TitleService } from '../../services/title.service';

export abstract class AbstractDetailScreen<TNode extends Collection | Entity> {
  protected readonly navigationService: NavigationService = inject(NavigationService);
  protected readonly route: ActivatedRoute = inject(ActivatedRoute);

  protected readonly configService: ConfigService = inject(ConfigService);
  protected readonly titleService: TitleService = inject(TitleService);
  protected readonly viewService: ViewService = inject(ViewService);

  protected readonly config: Registry = this.configService.config();
  protected readonly composition: WritableSignal<keyof DetailViews | undefined> = signal(undefined);

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
      catchError((error: unknown): Observable<never> => this.handleNodeError(error)),
    ),
    { initialValue: null },
  );

  protected readonly detailView: Signal<DetailView | null> = computed((): DetailView | null => {
    const composition: keyof DetailViews | undefined = this.composition();
    const labels: string[] = this.node()?._labels ?? [];
    if (!composition || labels.length === 0) return null;
    return this.config.getDetailView(composition, labels);
  });

  protected readonly blocks: Signal<Block[]> = computed((): Block[] => this.detailView()?.blocks ?? []);
  protected readonly accessPaths: Signal<string[]> = computed((): string[] => BlockPathResolver.resolvePaths(this.blocks()));
  protected readonly $view: HttpResourceRef<ViewResponse | undefined> = this.viewService.fetchView(this.uuid, this.accessPaths);

  protected readonly resolvedValues: Signal<Record<string, unknown>> = computed(
    (): Record<string, unknown> => this.$view.value()?.values ?? {},
  );

  protected constructor(composition: keyof DetailViews) {
    this.composition.set(composition);

    effect((): void => {
      const current: TNode | null = this.node();
      if (!current) return this.titleService.reset();
      this.titleService.set(this.node()?.label);
    });
  }

  protected handleNodeError(error: unknown): Observable<never> {
    if (error instanceof HttpErrorResponse && error.status === 404) {
      void this.navigationService.toNotFound();
      return EMPTY;
    }

    void this.navigationService.toError(REASONS.SERVER);
    return EMPTY;
  }
}
