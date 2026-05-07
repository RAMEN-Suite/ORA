import { Component, computed, inject, linkedSignal, Signal, signal, WritableSignal } from '@angular/core';
import { IftaLabel } from 'primeng/iftalabel';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ListService } from '../../../services/list.service';
import { HttpResourceRef } from '@angular/common/http';
import { DataView } from 'primeng/dataview';
import { CharacterListComponent } from '../../components/character-list/character-list.component';
import { ActivatedRoute, Params } from '@angular/router';
import { Utils } from '../../../utils/Utils';
import { NavigationService } from '../../../services/navigation.service';
import { RAMEN } from '../../../models/RAMEN';
import { List, Listable, ListOptions } from '../../../models/List';
import { ConfigService } from '../../../services/config.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Config } from '../../../models/Config';
import { SelectComponent } from '../../components/select/select.component';
import { ROUTES } from '../../../app.routes';
import { NodesViewComponent } from '../../components/data-view/nodes-view/nodes-view.component';
import { PreviousLinkedValue } from '../../../../types/global';
import { AppConfig } from '../../../models/AppConfig';
import { BibleListComponent } from '../../components/bible-list/bible-list.component';
import { BibleAlias, BibleListHelper } from '../../components/bible-list/bible-list.helper';
import Entity = RAMEN.Entity;
import Property = Config.Property;
import EntityNodes = Config.EntityNodes;
import EntityOption = Config.EntityOption;
import EntityIndex = Config.EntityIndex;
import BibleBook = Config.BibleBook;

const DEFAULT_OPTION: EntityOption = {
  icon: 'pi pi-folder-open',
  label: 'Alle Register',
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
  ],
  templateUrl: './entities.screen.html',
  styleUrl: './entities.screen.scss',
})
export class EntitiesScreen {
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly configService: ConfigService = inject(ConfigService);
  private readonly listService: ListService = inject(ListService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  private readonly config: AppConfig = this.configService.config();
  private readonly screen: EntityNodes = this.config.screen('entities');

  protected readonly bibleBooks: BibleBook[] = this.config.extensions('bible');
  protected readonly bibleAliases: BibleAlias[] = BibleListHelper.createIndex(this.bibleBooks);

  protected readonly nodeOptions: EntityOption[] = [...this.screen.nodes, DEFAULT_OPTION];
  protected readonly activeNode: WritableSignal<EntityOption> = signal<EntityOption>(this.config.initialNode(this.screen));
  protected readonly activeNodeLabel: Signal<string> = computed((): string => this.activeNode().value);
  protected readonly activeProperties: Signal<Property[]> = computed((): Property[] =>
    this.config.properties(this.screen, this.activeNode()),
  );

  protected readonly searchPhrase: WritableSignal<string> = signal('');

  protected readonly indexType: Signal<EntityIndex> = computed((): EntityIndex => this.activeNode().index ?? 'character');
  protected readonly activeIndex: WritableSignal<string> = signal('');

  protected readonly options: Signal<ListOptions> = signal({ orderBy: 'label', asc: true, limit: 0, skip: 0 });
  protected readonly $list: HttpResourceRef<List<Entity>> = this.listService.fetchList(
    Listable.ENTITY,
    this.activeNodeLabel,
    this.options,
  );

  protected readonly entities: Signal<List<Entity>> = linkedSignal({
    source: (): List<Entity> => this.$list.value(),
    computation: (source: List<Entity>, previous: PreviousLinkedValue<List<Entity>>): List<Entity> =>
      this.$list.isLoading() ? (previous?.value ?? source) : source,
  });

  protected readonly properties: Signal<Property[]> = linkedSignal({
    source: (): Property[] => this.activeProperties(),
    computation: (source: Property[], previous: PreviousLinkedValue<Property[]>): Property[] =>
      this.$list.isLoading() ? (previous?.value ?? source) : source,
  });

  protected readonly filteredEntities: Signal<Entity[]> = computed((): Entity[] => this.filterEntityList());
  protected readonly entityLabels: Signal<string[]> = computed((): string[] =>
    this.entities().data.map((e: Entity): string => e.label),
  );

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
      .filter((e: Entity): boolean => BibleListHelper.getBibleValue(e.label, this.bibleAliases) === currentIndex)
      .sort((a: Entity, b: Entity): number => BibleListHelper.compare(a.label, b.label, this.bibleAliases));
  }

  private filterByDefault(entities: Entity[], currentIndex: string): Entity[] {
    return entities.filter((e: Entity): boolean => {
      const index: string = Utils.firstCharacter(e.label);
      return currentIndex === '' || currentIndex === index;
    });
  }

  private applyQueryParams(params: Params): void {
    const index: string | undefined = params['index'];
    const searchPhrase: string | undefined = params['search'];
    const label: string | undefined = params['label'];

    if (label !== null && label !== undefined) {
      const existing: EntityOption | undefined = this.config.node(this.screen, label);
      if (existing) this.activeNode.set(existing);
    }

    this.searchPhrase.set(searchPhrase ?? '');
    this.activeIndex.set(index ?? '');
  }

  protected readonly ROUTES: typeof ROUTES = ROUTES;
}
