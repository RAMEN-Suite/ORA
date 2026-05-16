import { Choice, Config, DetailView, Features, FilterChoice, ListItem, ListView, Property, Screens, Selection } from './Config';

export class Registry {
  constructor(private readonly config: Config) {}

  public screen<K extends keyof Screens>(key: K): Screens[K] {
    return this.config.screens[key];
  }

  public features<K extends keyof Features>(key: K): Features[K] {
    return this.config.features[key];
  }

  public composed(key: 'collection' | 'entity', labels: string[]): DetailView {
    const views: DetailView[] = this.config.screens[key];
    const view: DetailView | undefined = views.find((candidate: DetailView): boolean => {
      return this.matches(candidate.match, labels);
    });

    if (!view) throw new Error(`Missing composed view for ${key}: ${labels.join(', ')}`);
    return view;
  }

  public node<TOption extends Choice>(screen: ListView<TOption>, value: string): TOption | undefined {
    return screen.items.find((node: TOption): boolean => node.value === value);
  }

  public properties(screen: ListView, node: ListItem): Property[] {
    return this.mergeProperties(screen.properties, node.properties);
  }

  public option<TOption extends Choice>(options: TOption[], value: string): TOption | undefined {
    return options.find((option: TOption): boolean => option.value === value);
  }

  public filters(node: ListItem): FilterChoice[] {
    return node.filters ?? [];
  }

  public filterPaths(node: ListItem): string[] {
    return this.filters(node).map((filter: FilterChoice): string => filter.value);
  }

  public initialNode<TOption extends Choice>(screen: ListView<TOption>): TOption {
    const node: TOption | undefined = screen.items.find((option: TOption): boolean => option.value === screen.initial);
    if (!node) throw new Error(`Missing initial node: ${screen.initial}`);
    return node;
  }

  public initialOption<TOption extends Choice>(selection: Selection<TOption> | undefined): TOption | undefined {
    if (!selection) return undefined;
    return selection.options.find((option: TOption): boolean => option.value === selection.initial) ?? selection.options[0];
  }

  private matches(expected: string[], actual: string[]): boolean {
    if (expected.length === 0) return true;
    return expected.every((label: string): boolean => actual.includes(label));
  }

  private mergeProperties(global: Property[] = [], local: Property[] = []): Property[] {
    const combined: Property[] = [...global, ...local];
    const map: Map<string, Property> = new Map<string, Property>(combined.map((p: Property): [string, Property] => [p.name, p]));
    return Array.from(map.values());
  }
}
