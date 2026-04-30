import { Component, computed, inject, linkedSignal, Signal, signal, WritableSignal } from '@angular/core';
import { IftaLabel } from 'primeng/iftalabel';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ListService } from '../../../services/list.service';
import { HttpResourceRef } from '@angular/common/http';
import { DataView } from 'primeng/dataview';
import { CharacterListComponent } from '../../components/character-list/character-list.component';
import { ActivatedRoute, Params } from '@angular/router';
import { Nullable } from 'primeng/ts-helpers';
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
import { ProgressSpinner } from 'primeng/progressspinner';
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

  protected readonly properties: Signal<Property[]> = computed((): Property[] => this.config().properties);
  protected readonly categories: Signal<Category[]> = computed((): Category[] => [...this.config().categories, DEFAULT_CATEGORY]);

  protected readonly searchPhrase: WritableSignal<string> = signal('');
  protected readonly activeCharacter: WritableSignal<string> = signal('');
  protected readonly activeCategory: WritableSignal<Category> = signal(this.getInitialCategory());
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
  protected readonly entityLabels: Signal<string[]> = computed((): string[] => {
    if (!this.$list.hasValue()) return [];
    return this.$list.value().data.map((e: Entity): string => e.label);
  });

  protected readonly filteredEntities: Signal<Entity[]> = computed((): Entity[] => this.filterEntityList());

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((params: Params): void => {
      const character: Nullable<string> = params['char'];
      const searchPhrase: Nullable<string> = params['search'];
      const type: Nullable<string> = params['type'];

      if (type !== null && type !== undefined) this.activeCategory.set(this.getCategory(type) ?? this.getInitialCategory());
      if (searchPhrase) this.searchPhrase.set(searchPhrase);
      if (character) this.activeCharacter.set(character.toLocaleUpperCase());
    });
  }

  protected handleCategory($event: Nullable<Category>): void {
    if (!$event) return;
    this.activeCategory.set($event);
    this.navigationService.updateQuery(this.route, { type: $event.value });
  }

  protected handleCharacter($event: string): void {
    this.activeCharacter.set($event);
    this.navigationService.updateQuery(this.route, { char: this.searchPhrase() === '' ? $event : null });
  }

  protected handleSearch($event: string): void {
    const phrase: string = $event.trim();
    if (phrase !== '' && phrase.length < 2) return;

    this.searchPhrase.set(phrase);
    const char: Nullable<string> = phrase === '' ? this.activeCharacter() : null;
    this.navigationService.updateQuery(this.route, { char, search: phrase || null });
  }

  private filterEntityList(): Entity[] {
    if (!this.entityList || this.activeCharacter() === '') return [];

    const searchPhrase: string = Utils.normalize(this.searchPhrase(), { toLower: true });
    const entities: Entity[] = this.entityList().data;
    const currentCharacter: string = this.activeCharacter();

    if (searchPhrase !== '') {
      return entities.filter((e: Entity): boolean => {
        const normalized: string = Utils.normalize(e.label, { toLower: true });
        return normalized.includes(searchPhrase);
      });
    }

    return entities.filter((e: Entity): boolean => {
      const character: string = this.getFirstCharacter(e.label);
      return currentCharacter === '' || currentCharacter === character;
    });
  }

  private getInitialCategory(): Category {
    const initialType: string = this.config().initialType;
    return this.getCategory(initialType) ?? DEFAULT_CATEGORY;
  }

  private getCategory(type: string): Nullable<Category> {
    return this.categories().find((c: Category): boolean => c.value === type);
  }

  private getFirstCharacter(value: string): string {
    const normalized: string = Utils.normalize(value, { toUpper: true });
    const firstChar: string = normalized.charAt(0);
    return /^\p{L}$/u.test(firstChar) ? firstChar : '#';
  }

  protected readonly ROUTES: typeof ROUTES = ROUTES;
  protected readonly Element = Element;
}
