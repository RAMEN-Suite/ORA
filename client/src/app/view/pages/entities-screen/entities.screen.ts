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
import { ProgressSpinner } from 'primeng/progressspinner';
import { AppConfig } from '../../../models/AppConfig';
import Entity = RAMEN.Entity;
import Property = Config.Property;
import MultiNode = Config.MultiNode;
import NodeOption = Config.NodeOption;

const DEFAULT_OPTION: NodeOption = {
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

  private readonly config: Signal<AppConfig> = computed((): AppConfig => this.configService.config());
  private readonly screen: Signal<MultiNode> = computed((): MultiNode => this.config().screen('entities'));

  protected readonly nodes: Signal<NodeOption[]> = computed((): NodeOption[] => [...this.screen().nodes, DEFAULT_OPTION]);
  protected readonly activeNode: WritableSignal<NodeOption> = signal<NodeOption>(this.config().initialNode(this.screen()));
  protected readonly activeNodeLabel: Signal<string> = computed((): string => this.activeNode().value);
  protected readonly rawProperties: Signal<Property[]> = computed((): Property[] =>
    this.config().properties(this.screen(), this.activeNode()),
  );

  protected readonly searchPhrase: WritableSignal<string> = signal('');
  protected readonly activeCharacter: WritableSignal<string> = signal('');

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
    source: (): Property[] => this.rawProperties(),
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

  protected handleNodeChange(option: NodeOption | undefined): void {
    if (!option) return;
    this.activeNode.set(option);
    this.navigationService.updateQuery(this.route, { label: option.value || null });
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
    if (this.activeCharacter() === '') return [];

    const searchPhrase: string = Utils.normalize(this.searchPhrase(), { toLower: true });
    const entities: Entity[] = this.entities().data;
    const currentCharacter: string = this.activeCharacter();

    if (searchPhrase !== '') {
      return entities.filter((e: Entity): boolean => {
        const normalized: string = Utils.normalize(e.label, { toLower: true });
        return normalized.includes(searchPhrase);
      });
    }

    return entities.filter((e: Entity): boolean => {
      const character: string = Utils.firstCharacter(e.label);
      return currentCharacter === '' || currentCharacter === character;
    });
  }

  private applyQueryParams(params: Params): void {
    const character: string | undefined = params['char'];
    const searchPhrase: string | undefined = params['search'];
    const label: string | undefined = params['label'];

    if (label !== null && label !== undefined) {
      const existing: NodeOption | undefined = this.config().node(this.screen(), label);
      if (existing) this.activeNode.set(existing);
    }

    this.searchPhrase.set(searchPhrase ?? '');
    this.activeCharacter.set(character?.toLocaleUpperCase() ?? '');
  }

  protected readonly ROUTES: typeof ROUTES = ROUTES;
}
