export interface Features {
  bible: BibleBook[];
}

export interface BibleBook {
  key: string;
  aliases: string[];
}
