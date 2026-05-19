import { Config } from './config/Config';
import { Features } from './config/Features';
import { DetailView, DetailViews } from './config/DetailViews';
import { ListViews } from './config/ListViews';
import { Annotations } from '../view/shared/text-view/models/Annotations';

export class Registry {
  constructor(private readonly config: Config) {}

  public list<K extends keyof ListViews>(key: K): ListViews[K] {
    return this.config.lists[key];
  }

  public feature<K extends keyof Features>(key: K): Features[K] {
    return this.config.features[key];
  }

  public annotations(): Annotations {
    return this.config.annotations;
  }

  public composition(key: keyof DetailViews, labels: string[]): DetailView {
    const views: DetailView[] = this.config.details[key];

    const view: DetailView | undefined = views.find((candidate: DetailView): boolean => {
      if (candidate.match.length === 0) return true;
      return candidate.match.every((label: string): boolean => labels.includes(label));
    });

    if (!view) throw new Error(`Missing composed view for ${key}: ${labels.join(', ')}`);
    return view;
  }
}
