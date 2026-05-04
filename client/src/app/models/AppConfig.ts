import { Config } from './Config';
import Root = Config.Root;
import Screens = Config.Screens;
import MultiNode = Config.MultiNode;
import Option = Config.Option;
import NodeOption = Config.NodeOption;
import Property = Config.Property;

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

  public initialNode(screen: MultiNode): NodeOption {
    const node: Option | undefined = screen.nodes.find((o: NodeOption): boolean => o.value === screen.initial);
    if (!node) throw Error(`Missing initial node: ${screen.initial}`);
    return node;
  }

  private mergeProperties(global: Property[] = [], local: Property[] = []): Property[] {
    const combined: Property[] = [...global, ...local];
    const map: Map<string, Property> = new Map(combined.map((p: Property): [string, Property] => [p.name, p]));
    return Array.from(map.values());
  }
}
