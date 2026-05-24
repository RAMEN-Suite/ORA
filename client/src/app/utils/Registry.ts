import { Config } from '../models/config/Config';
import { FeatureOptions } from '../models/config/FeatureOptions';
import { DetailView, DetailViews } from '../models/config/DetailViews';
import { ListViews } from '../models/config/ListViews';
import { Annotations } from '../models/config/Annotations';
import { LanguageOptions, SiteOptions } from '../models/config/SiteOptions';

export class Registry {
  public constructor(private readonly config: Config) {}

  public site(): SiteOptions {
    return this.config.site;
  }

  public language(): LanguageOptions {
    return this.config.site.language;
  }

  public list<K extends keyof ListViews>(key: K): ListViews[K] {
    return this.config.lists[key];
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

  public annotations(): Annotations {
    return this.config.annotations;
  }

  public feature<K extends keyof FeatureOptions>(key: K): FeatureOptions[K] {
    return this.config.features[key];
  }
}
