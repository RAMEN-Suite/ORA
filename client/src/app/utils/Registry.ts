import { Config } from '../models/config/Config';
import { ListIndexConfig } from '../models/config/IndexOptions';
import { DetailView, DetailViews } from '../models/config/DetailViews';
import { ListViews } from '../models/config/ListViews';
import { Annotations } from '../models/config/Annotations';
import { SiteOptions } from '../models/config/SiteOptions';

export class Registry {
  public constructor(private readonly config: Config) {}

  public getSite(): SiteOptions {
    return this.config.site;
  }

  public getListView<K extends keyof ListViews>(key: K): ListViews[K] {
    return this.config.lists[key];
  }

  public getComposition(key: keyof DetailViews, labels: string[]): DetailView {
    const views: DetailView[] = this.config.details[key];

    const view: DetailView | undefined = views.find((candidate: DetailView): boolean => {
      if (candidate.match.length === 0) return true;
      return candidate.match.every((label: string): boolean => labels.includes(label));
    });

    if (!view) throw new Error(`Missing composed view for ${key}: ${labels.join(', ')}`);
    return view;
  }

  public getAnnotations(): Annotations {
    return this.config.annotations;
  }

  public getIndex(key: string): ListIndexConfig | undefined {
    return this.config.indexes[key];
  }
}
