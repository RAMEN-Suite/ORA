export type ListIndexType = 'character' | 'alias-list' | 'bible';
export type IndexOptions = Record<string, ListIndexConfig>;

export interface ListIndexConfig {
  type: ListIndexType;
  items?: ListIndexItem[];
  unknownLabel?: string;
}

export interface ListIndexItem {
  key: string;
  aliases: string[];
}
