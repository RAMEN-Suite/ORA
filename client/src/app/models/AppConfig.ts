import { Config } from './Config';
import Root = Config.Root;
import Screens = Config.Screens;
import MultiNode = Config.MultiNode;
import Option = Config.Option;
import NodeOption = Config.NodeOption;
import Property = Config.Property;
import Selection = Config.Selection;
import FilterOption = Config.FilterOption;

export class AppConfig {
  constructor(private readonly config: Root) {}

  public screen<K extends keyof Screens>(key: K): Screens[K] {
    return this.config.screens[key];
  }

  public node(screen: MultiNode, value: string): NodeOption | undefined {
    return screen.nodes.find((node: NodeOption): boolean => node.value === value);
  }

  public properties(screen: MultiNode, node: NodeOption): Property[] {
    return this.mergeProperties(screen.properties, node.properties);
  }

  public option(options: Option[], value: string): Option | undefined {
    return options.find((o: Option): boolean => o.value === value);
  }

  public filters(node: NodeOption): FilterOption[] {
    return node.filters ?? [];
  }

  public filterPaths(node: NodeOption): string[] {
    return this.filters(node).map((filter: FilterOption): string => filter.value);
  }

  public initialNode(screen: MultiNode): NodeOption {
    const node: Option | undefined = screen.nodes.find((o: NodeOption): boolean => o.value === screen.initial);
    if (!node) throw Error(`Missing initial node: ${screen.initial}`);
    return node;
  }

  public initialOption(selection: Selection | undefined): Option | undefined {
    if (!selection) return undefined;
    return selection.options.find((o: Option): boolean => o.value === selection.initial) ?? selection.options[0];
  }

  private mergeProperties(global: Property[] = [], local: Property[] = []): Property[] {
    const combined: Property[] = [...global, ...local];
    const map: Map<string, Property> = new Map(combined.map((p: Property): [string, Property] => [p.name, p]));
    return Array.from(map.values());
  }
}
