import { Component, computed, inject, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { IftaLabel } from 'primeng/iftalabel';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { PanelMenu } from 'primeng/panelmenu';
import { ScrollTop } from 'primeng/scrolltop';
import { DataService } from '../../../service/data.service';
import removeAccents from 'remove-accents';
import { Entity } from '../../../models/ramen/Entity';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-entity',
  imports: [IftaLabel, InputText, Button, PanelMenu, ScrollTop, FormsModule, LoadingSpinnerComponent],
  templateUrl: './entities.screen.html',
  styleUrl: './entities.screen.scss',
})
export class EntitiesScreen implements OnInit {
  public readonly data: DataService = inject(DataService);

  public selectedCategory: string = 'Person';
  public availableCategories: string[] = [];

  public selectedCharacter: WritableSignal<string> = signal('A');
  public availableCharacters: Signal<string[]> = computed((): string[] => this.generateCharacterList());

  public searchPhrase: WritableSignal<string> = signal('');
  public filteredEntities: Signal<Entity[]> = computed((): Entity[] => this.filterEntityList());

  public ngOnInit(): void {
    this.selectCategory('Person');
  }

  public selectCategory(category: string): void {
    this.data.fetchEntities(category, { orderBy: 'label', asc: true });
  }

  private generateCharacterList(): string[] {
    const characters: Set<string> = new Set<string>();

    for (const entity of this.data.entities()) {
      const character: string = removeAccents(entity.label).charAt(0).toUpperCase();
      characters.add(character);
    }

    return Array.from(characters).sort((a: string, b: string): number => a.localeCompare(b));
  }

  private filterEntityList(): Entity[] {
    return this.data.entities().filter((e: Entity): boolean => {
      const isStartingWith: boolean = e.label.toLowerCase().startsWith(this.selectedCharacter().toLowerCase());
      if (this.searchPhrase() === '') return isStartingWith;

      const label: string = removeAccents(e.label).toLowerCase();
      return label.includes(this.searchPhrase().toLowerCase());
    });
  }
}
