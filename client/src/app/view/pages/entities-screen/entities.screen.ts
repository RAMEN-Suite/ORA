import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { IftaLabel } from 'primeng/iftalabel';
import { InputText } from 'primeng/inputtext';
import { ScrollTop } from 'primeng/scrolltop';
import { Entity } from '../../../models/ramen/Entity';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { Select } from 'primeng/select';
import { DataService } from '../../../services/data.service';
import { ListOptions } from '../../../models/utility/Options';
import { HttpResourceRef } from '@angular/common/http';
import { DataView } from 'primeng/dataview';
import { Divider } from 'primeng/divider';
import { CharacterListComponent } from '../../components/character-list/character-list.component';
import { ActivatedRoute, Params } from '@angular/router';
import { Nullable } from 'primeng/ts-helpers';
import { Utils } from '../../../utils/Utils';
import { NavigationService } from '../../../services/navigation.service';

interface Category extends MenuItem {
  value: string;
}

@Component({
  selector: 'app-entity',
  imports: [IftaLabel, InputText, ScrollTop, FormsModule, Select, DataView, Divider, CharacterListComponent],
  templateUrl: './entities.screen.html',
  styleUrl: './entities.screen.scss',
})
export class EntitiesScreen {
  private readonly data: DataService = inject(DataService);
  private readonly navigation: NavigationService = inject(NavigationService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  public currentCategory: WritableSignal<Category> = signal({
    icon: 'pi pi-user',
    label: 'Personenregister',
    value: 'Person',
  });
  public currentCategoryValue: Signal<string> = computed((): string => this.currentCategory().value);
  public currentCategoryOptions: Signal<ListOptions> = signal({ orderBy: 'label', asc: true });

  public searchPhrase: WritableSignal<string> = signal('');
  public currentCharacter: WritableSignal<string> = signal('');
  public filteredEntities: Signal<Entity[]> = computed((): Entity[] => this.filterEntityList());

  public categories: Category[] = [
    {
      icon: 'pi pi-user',
      label: 'Personenregister',
      value: 'Person',
    },
    {
      icon: 'pi pi-map',
      label: 'Ortsregister',
      value: 'Place',
    },
    {
      icon: 'pi pi-book',
      label: 'Bibelstellenregister',
      value: 'BibleVerse',
    },
    {
      icon: 'pi pi-tags',
      label: 'Sachregister',
      value: 'Term',
    },
    {
      icon: 'pi pi-folder-open',
      label: 'Alle Register',
      value: '',
    },
  ];

  public readonly labels: Signal<string[]> = computed((): string[] => {
    if (!this.$entities.hasValue()) return [];
    return this.$entities.value().map((e: Entity): string => e.label);
  });

  public readonly $entities: HttpResourceRef<Entity[]> = this.data.fetchEntities(
    this.currentCategoryValue,
    this.currentCategoryOptions,
  );

  constructor() {
    this.route.queryParams.subscribe((params: Params): void => {
      const character: Nullable<string> = params['char'];
      const searchPhrase: Nullable<string> = params['search'];

      if (searchPhrase) this.searchPhrase.set(searchPhrase);
      if (character) this.currentCharacter.set(character.toLocaleUpperCase());
    });
  }

  public handleCategory($event: Category): void {
    this.currentCategory.set($event);
    this.navigation.updateQuery(this.route, { type: $event.value });
  }

  public handleCharacter($event: string): void {
    this.currentCharacter.set($event);
    this.navigation.updateQuery(this.route, { char: this.searchPhrase() === '' ? $event : null });
  }

  public handleSearch($event: string): void {
    const phrase: string = $event.trim();
    if (phrase !== '' && phrase.length < 2) return;

    this.searchPhrase.set(phrase);
    const char: Nullable<string> = phrase === '' ? this.currentCharacter() : null;
    this.navigation.updateQuery(this.route, { char, search: phrase || null });
  }

  private filterEntityList(): Entity[] {
    if (!this.$entities.hasValue()) return [];

    const searchPhrase: string = Utils.normalize(this.searchPhrase(), { toLower: true });
    const entities: Entity[] = this.$entities.value();
    const currentCharacter: string = this.currentCharacter();

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

  private getFirstCharacter(value: string): string {
    const normalized: string = Utils.normalize(value, { toUpper: true });
    const firstChar: string = normalized.charAt(0);
    return /^\p{L}$/u.test(firstChar) ? firstChar : '#';
  }
}
