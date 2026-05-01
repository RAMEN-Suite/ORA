import { Component, computed, inject, linkedSignal, Signal, signal, WritableSignal } from '@angular/core';
import { IftaLabel } from 'primeng/iftalabel';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ListService } from '../../../services/list.service';
import { HttpResourceRef } from '@angular/common/http';
import { DataView } from 'primeng/dataview';
import { CharacterListComponent } from '../../components/character-list/character-list.component';
import { ActivatedRoute, Params } from '@angular/router';
import { StringUtils } from '../../../utils/StringUtils';
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
import { ProgressSpinner } from 'primeng/progressspinner';
import { Categories, Properties } from '../../../utils/ConfigUtils';
import Entity = RAMEN.Entity;
import Category = Config.Category;
import Property = Config.Property;

const DEFAULT_CATEGORY: Category = {
  icon: 'pi pi-folder-open',
  label: 'Alle Register',
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
    ProgressSpinner,
  ],
  templateUrl: './entities.screen.html',
  styleUrl: './entities.screen.scss',
})
export class EntitiesScreen {
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly configService: ConfigService = inject(ConfigService);
  private readonly listService: ListService = inject(ListService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  private readonly config: Signal<Config.EntitiesScreen> = computed(
    (): Config.EntitiesScreen => this.configService.screens().entities,
  );

  protected readonly initialType: Signal<string> = computed((): string => this.config().initialType);
  protected readonly categories: Signal<Category[]> = computed((): Category[] => [...this.config().categories, DEFAULT_CATEGORY]);
  protected readonly properties: Signal<Property[]> = computed((): Property[] =>
    Properties.scoped(this.config().properties, this.activeType()),
  );

  protected readonly searchPhrase: WritableSignal<string> = signal('');
  protected readonly activeCharacter: WritableSignal<string> = signal('');
  protected readonly activeCategory: WritableSignal<Category> = signal(Categories.initial(this.categories(), this.initialType()));

  protected readonly activeType: Signal<string> = computed((): string => this.activeCategory().value);
  protected readonly options: Signal<ListOptions> = signal({ orderBy: 'label', asc: true, limit: 0, skip: 0 });
  protected readonly $list: HttpResourceRef<List<Entity>> = this.listService.fetchList(
    Listable.ENTITY,
    this.activeType,
    this.options,
  );

  protected readonly entityList: Signal<List<Entity>> = linkedSignal({
    source: (): List<Entity> => this.$list.value(),
    computation: (source: List<Entity>, previous: PreviousLinkedValue<List<Entity>>): List<Entity> =>
      this.$list.isLoading() ? (previous?.value ?? source) : source,
  });

  protected readonly propertyList: Signal<Property[]> = linkedSignal({
    source: (): Property[] => this.properties(),
    computation: (source: Property[], previous: PreviousLinkedValue<Property[]>): Property[] =>
      this.$list.isLoading() ? (previous?.value ?? source) : source,
  });

  protected readonly filteredEntities: Signal<Entity[]> = computed((): Entity[] => this.filterEntityList());
  protected readonly entityLabels: Signal<string[]> = computed((): string[] =>
    this.entityList().data.map((e: Entity): string => e.label),
  );

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((params: Params): void => {
      const character: string | undefined = params['char'];
      const searchPhrase: string | undefined = params['search'];
      const type: string | undefined = params['type'];

      if (type !== undefined) {
        const existing: Category | undefined = Categories.find(this.categories(), type);
        if (existing) this.activeCategory.set(existing);
      }
      if (searchPhrase) this.searchPhrase.set(searchPhrase);
      if (character) this.activeCharacter.set(character.toLocaleUpperCase());
    });
  }

  protected handleCategoryChange(category: Category | undefined): void {
    if (!category) return;
    this.activeCategory.set(category);
    this.navigationService.updateQuery(this.route, { type: category.value });
  }

  protected handleCharacterChange(character: string): void {
    this.activeCharacter.set(character);
    this.navigationService.updateQuery(this.route, { char: this.searchPhrase() === '' ? character : null });
  }

  protected handleSearchChange(input: string): void {
    const phrase: string = input.trim();
    if (phrase !== '' && phrase.length < 2) return;

    this.searchPhrase.set(phrase);
    const char: string | null = phrase === '' ? this.activeCharacter() : null;
    this.navigationService.updateQuery(this.route, { char, search: phrase || null });
  }

  private filterEntityList(): Entity[] {
    if (!this.entityList || this.activeCharacter() === '') return [];

    const searchPhrase: string = StringUtils.normalize(this.searchPhrase(), { toLower: true });
    const entities: Entity[] = this.entityList().data;
    const currentCharacter: string = this.activeCharacter();

    if (searchPhrase !== '') {
      return entities.filter((e: Entity): boolean => {
        const normalized: string = StringUtils.normalize(e.label, { toLower: true });
        return normalized.includes(searchPhrase);
      });
    }

    return entities.filter((e: Entity): boolean => {
      const character: string = StringUtils.firstCharacter(e.label);
      return currentCharacter === '' || currentCharacter === character;
    });
  }

  protected readonly ROUTES: typeof ROUTES = ROUTES;
}
