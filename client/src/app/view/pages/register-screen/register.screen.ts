import { Component, computed, effect, inject, Signal, signal, WritableSignal } from '@angular/core';
import { IftaLabel } from 'primeng/iftalabel';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { ScrollTop } from 'primeng/scrolltop';
import removeAccents from 'remove-accents';
import { Entity } from '../../../models/ramen/Entity';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { Select } from 'primeng/select';
import { DataService } from '../../../services/data.service';
import { ListOptions } from '../../../models/utility/Options';
import { HttpResourceRef } from '@angular/common/http';

interface Category extends MenuItem {
  value: string;
}

@Component({
  selector: 'app-entity',
  imports: [IftaLabel, InputText, Button, ScrollTop, FormsModule, Select],
  templateUrl: './register.screen.html',
  styleUrl: './register.screen.scss',
})
export class RegisterScreen {
  private readonly data: DataService = inject(DataService);

  public currentCategory: WritableSignal<Category> = signal({
    icon: 'pi pi-user',
    label: 'Personenregister',
    value: 'Person',
  });
  public currentCategoryValue: Signal<string> = computed((): string => this.currentCategory().value);
  public currentCategoryOptions: Signal<ListOptions> = signal({ orderBy: 'label', asc: true });

  public currentCharacter: WritableSignal<string> = signal('');
  public characters: WritableSignal<string[]> = signal([]);

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

  public readonly $entities: HttpResourceRef<Entity[]> = this.data.fetchEntities(
    this.currentCategoryValue,
    this.currentCategoryOptions,
  );

  constructor() {
    effect((): void => {
      const characters: string[] = this.generateCharacterList();
      this.characters.set(characters);
      this.currentCharacter.set(characters[0] ?? '');
    });
  }

  public searchPhrase: WritableSignal<string> = signal('');
  public filteredEntities: Signal<Entity[]> = computed((): Entity[] => this.filterEntityList());

  private generateCharacterList(): string[] {
    if (!this.$entities.hasValue()) return [];

    const characters: Set<string> = new Set<string>();
    const entities: Entity[] = this.$entities.value();
    for (const entity of entities) characters.add(this.getFirstCharacter(entity.label));

    return Array.from(characters).sort((a: string, b: string): number => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    });
  }

  private getFirstCharacter(value: string): string {
    const normalized: string = removeAccents(value.trim());
    const firstChar: string = normalized.charAt(0).toUpperCase();
    return /^\p{L}$/u.test(firstChar) ? firstChar : '#';
  }

  private filterEntityList(): Entity[] {
    if (!this.$entities.hasValue()) return [];

    const searchPhrase: string = removeAccents(this.searchPhrase().trim());
    const entities: Entity[] = this.$entities.value();
    const currentCharacter: string = this.currentCharacter();

    if (searchPhrase !== '') {
      return entities.filter((e: Entity): boolean => {
        const normalizedLabel: string = removeAccents(e.label.trim());
        return normalizedLabel.includes(searchPhrase);
      });
    }

    return entities.filter((e: Entity): boolean => {
      const character: string = this.getFirstCharacter(e.label);
      return currentCharacter === '' || currentCharacter === character;
    });
  }
}
