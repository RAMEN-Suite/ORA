import { Component, computed, inject, linkedSignal, Signal, signal, WritableSignal } from '@angular/core';
import { IftaLabel } from 'primeng/iftalabel';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ListService } from '../../../services/list.service';
import { HttpResourceRef } from '@angular/common/http';
import { DataView } from 'primeng/dataview';
import { CharacterListComponent } from '../../shared/character-list/character-list.component';
import { ActivatedRoute, Params } from '@angular/router';
import { Utils } from '../../../utils/Utils';
import { NavigationService } from '../../../services/navigation.service';
import { List, Listable, ListOptions } from '../../../models/List';
import { ConfigService } from '../../../services/config.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectComponent } from '../../shared/select/select.component';
import { ROUTES } from '../../../app.routes';
import { NodesViewComponent } from '../../shared/data-view/nodes-view/nodes-view.component';
import { PreviousLinkedValue } from '../../../../types/global';
import { Registry } from '../../../models/Registry';
import { BibleListComponent } from '../../features/bible-list/bible-list.component';
import { BibleAlias, BibleListHelper } from '../../features/bible-list/bible-list.helper';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { BibleBook, EntityIndex, EntityOption, ListScreen, Property } from '../../../models/Config';
import { Entity } from '../../../models/RAMEN';

const DEFAULT_OPTION: EntityOption = {
  icon: 'pi pi-folder-open',
  label: 'app.entities.default',
  index: 'character',
  value: '',
};

@Component({
  selector: 'screen-entities',
  imports: [
    IftaLabel,
    InputText,
    FormsModule,
    DataView,
    CharacterListComponent,
    SelectComponent,
    NodesViewComponent,
    BibleListComponent,
    TranslocoDirective,
  ],
  templateUrl: './entities.screen.html',
})
export class EntitiesScreen {
  private readonly translocoService: TranslocoService = inject(TranslocoService);
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly configService: ConfigService = inject(ConfigService);
  private readonly listService: ListService = inject(ListService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  private readonly config: Registry = this.configService.config();
  private readonly screen: ListScreen<EntityOption> = this.config.screen('entities');

  protected readonly bibleBooks: BibleBook[] = this.config.features('bible');
  protected readonly bibleAliases: BibleAlias[] = BibleListHelper.createIndex(this.bibleBooks);

  protected readonly nodeOptions: EntityOption[] = [...this.screen.nodes, DEFAULT_OPTION];
  protected readonly activeNode: WritableSignal<EntityOption> = signal<EntityOption>(this.config.initialNode(this.screen));
  protected readonly activeNodeLabel: Signal<string> = computed((): string => this.activeNode().value);
  protected readonly activeProperties: Signal<Property[]> = computed((): Property[] =>
    this.config.properties(this.screen, this.activeNode()),
  );

  protected readonly indexType: Signal<EntityIndex> = computed((): EntityIndex => this.activeNode().index ?? 'character');
  protected readonly activeIndex: WritableSignal<string> = signal('');
  protected readonly activeIndexLabel: Signal<string> = computed((): string => {
    if (this.searchPhrase()) return this.searchPhrase();
    const index: string = this.activeIndex();
    return index.length > 1 ? this.translocoService.translate(index) : index;
  });

  protected readonly searchPhrase: WritableSignal<string> = signal('');
  protected readonly filteredEntities: Signal<Entity[]> = computed((): Entity[] => this.filterEntityList());

  protected readonly listOptions: Signal<ListOptions> = signal({ orderBy: 'label', asc: true, limit: 0, skip: 0 });
  protected readonly $list: HttpResourceRef<List<Entity>> = this.listService.fetchList(
    Listable.ENTITY,
    this.activeNodeLabel,
    this.listOptions,
  );

  protected readonly entities: Signal<List<Entity>> = linkedSignal({
    source: (): List<Entity> => this.$list.value(),
    computation: (source: List<Entity>, previous: PreviousLinkedValue<List<Entity>>): List<Entity> =>
      this.$list.isLoading() ? (previous?.value ?? source) : source,
  });
  protected readonly entityLabels: Signal<string[]> = computed((): string[] =>
    this.entities().data.map((e: Entity): string => e.label),
  );

  protected readonly properties: Signal<Property[]> = linkedSignal({
    source: (): Property[] => this.activeProperties(),
    computation: (source: Property[], previous: PreviousLinkedValue<Property[]>): Property[] =>
      this.$list.isLoading() ? (previous?.value ?? source) : source,
  });

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe(this.applyQueryParams.bind(this));
  }

  protected handleNodeChange(option: EntityOption | undefined): void {
    if (!option) return;
    this.activeNode.set(option);
    this.activeIndex.set('');
    this.navigationService.updateQuery(this.route, { label: option.value || null, index: null });
  }

  protected handleIndexChange(index: string): void {
    this.activeIndex.set(index);
    this.navigationService.updateQuery(this.route, { index: this.searchPhrase() === '' ? index : null });
  }

  protected handleSearchChange(input: string): void {
    const phrase: string = input.trim();
    if (phrase !== '' && phrase.length < 2) return;

    this.searchPhrase.set(phrase);
    const index: string | null = phrase === '' ? this.activeIndex() : null;
    this.navigationService.updateQuery(this.route, { index, search: phrase || null });
  }

  private filterEntityList(): Entity[] {
    const searchPhrase: string = Utils.normalize(this.searchPhrase(), { toLower: true });
    const entities: Entity[] = this.entities().data;
    const currentIndex: string = this.activeIndex();

    if (searchPhrase !== '') return this.filterBySearch(entities, searchPhrase);
    if (currentIndex === '') return [];

    if (this.indexType() === 'bible') return this.filterByBible(entities, currentIndex);
    return this.filterByDefault(entities, currentIndex);
  }

  private filterBySearch(entities: Entity[], searchPhrase: string): Entity[] {
    return entities.filter((e: Entity): boolean => {
      const normalized: string = Utils.normalize(e.label, { toLower: true });
      return normalized.includes(searchPhrase);
    });
  }

  private filterByBible(entities: Entity[], currentIndex: string): Entity[] {
    return entities
      .filter((e: Entity): boolean => BibleListHelper.value(e.label, this.bibleAliases) === currentIndex)
      .sort((a: Entity, b: Entity): number => BibleListHelper.compare(a.label, b.label, this.bibleAliases));
  }

  private filterByDefault(entities: Entity[], currentIndex: string): Entity[] {
    return entities.filter((e: Entity): boolean => {
      const index: string = Utils.firstCharacter(e.label);
      return currentIndex === '' || currentIndex === index;
    });
  }

  private applyQueryParams(params: Params): void {
    const index: string | undefined = Utils.parseString(params['index']);
    const searchPhrase: string | undefined = Utils.parseString(params['search']);
    const label: string | undefined = Utils.parseString(params['label']);

    if (label !== undefined) {
      const existing: EntityOption | undefined = this.config.node(this.screen, label);
      if (existing) this.activeNode.set(existing);
    }

    this.searchPhrase.set(searchPhrase ?? '');
    this.activeIndex.set(index ?? '');
  }

  protected readonly ROUTES: typeof ROUTES = ROUTES;
}
