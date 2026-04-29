import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { IftaLabel } from 'primeng/iftalabel';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ListService } from '../../../services/api/list.service';
import { HttpResourceRef } from '@angular/common/http';
import { DataView } from 'primeng/dataview';
import { Divider } from 'primeng/divider';
import { CharacterListComponent } from '../../components/character-list/character-list.component';
import { ActivatedRoute, Params, RouterLink } from '@angular/router';
import { Nullable } from 'primeng/ts-helpers';
import { Utils } from '../../../utils/Utils';
import { NavigationService } from '../../../services/navigation.service';
import { RAMEN } from '../../../models/RAMEN';
import { List, Listable, ListOptions } from '../../../models/List';
import { ConfigService } from '../../../services/api/config.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Config } from '../../../models/Config';
import { SelectComponent } from '../../components/select/select.component';
import { PropertyListComponent } from '../../components/property-list/property-list.component';
import Entity = RAMEN.Entity;
import Category = Config.Category;
import Property = Config.Property;

const DEFAULT_CATEGORY: Category = {
  icon: 'pi pi-folder-open',
  label: 'Alle Register',
  value: '',
};

@Component({
  selector: 'app-entity',
  imports: [
    IftaLabel,
    InputText,
    FormsModule,
    DataView,
    Divider,
    CharacterListComponent,
    SelectComponent,
    PropertyListComponent,
    RouterLink,
  ],
  templateUrl: './entities.screen.html',
  styleUrl: './entities.screen.scss',
})
export class EntitiesScreen {
  private readonly data: ListService = inject(ListService);
  private readonly config: ConfigService = inject(ConfigService);
  private readonly navigation: NavigationService = inject(NavigationService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  private readonly settings: Signal<Config.EntitiesScreen> = computed(() => this.config.screens().entities);

  public searchPhrase: WritableSignal<string> = signal('');
  public selectedCharacter: WritableSignal<string> = signal('');
  public filteredEntities: Signal<Entity[]> = computed((): Entity[] => this.filterEntityList());

  public properties: Signal<Property[]> = computed((): Property[] => this.settings().properties);
  public categories: Signal<Category[]> = computed((): Category[] => [...this.settings().categories, DEFAULT_CATEGORY]);
  public selectedCategory: WritableSignal<Category> = signal(this.getInitialCategory());

  public selectedType: Signal<string> = computed((): string => this.selectedCategory()?.value ?? '');
  public options: Signal<ListOptions> = signal({ orderBy: 'label', asc: true, limit: 0, skip: 0 });
  public readonly $list: HttpResourceRef<List<Entity>> = this.data.fetchList(Listable.ENTITY, this.selectedType, this.options);

  public readonly labels: Signal<string[]> = computed((): string[] => {
    if (!this.$list.hasValue()) return [];
    return this.$list.value().data.map((e: Entity): string => e.label);
  });

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((params: Params): void => {
      const character: Nullable<string> = params['char'];
      const searchPhrase: Nullable<string> = params['search'];
      const type: Nullable<string> = params['type'];

      if (type !== null && type !== undefined) this.selectedCategory.set(this.getCategory(type) ?? this.getInitialCategory());
      if (searchPhrase) this.searchPhrase.set(searchPhrase);
      if (character) this.selectedCharacter.set(character.toLocaleUpperCase());
    });
  }

  public handleCategory($event: Nullable<Category>): void {
    if (!$event) return;
    this.selectedCategory.set($event);
    this.navigation.updateQuery(this.route, { type: $event.value });
  }

  public handleCharacter($event: string): void {
    this.selectedCharacter.set($event);
    this.navigation.updateQuery(this.route, { char: this.searchPhrase() === '' ? $event : null });
  }

  public handleSearch($event: string): void {
    const phrase: string = $event.trim();
    if (phrase !== '' && phrase.length < 2) return;

    this.searchPhrase.set(phrase);
    const char: Nullable<string> = phrase === '' ? this.selectedCharacter() : null;
    this.navigation.updateQuery(this.route, { char, search: phrase || null });
  }

  private filterEntityList(): Entity[] {
    if (!this.$list.hasValue() || this.selectedCharacter() === '') return [];

    const searchPhrase: string = Utils.normalize(this.searchPhrase(), { toLower: true });
    const entities: Entity[] = this.$list.value().data;
    const currentCharacter: string = this.selectedCharacter();

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
    const initialType: string = this.settings().initialType;
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
}
