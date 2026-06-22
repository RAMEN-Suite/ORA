import { Component, computed, effect, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { map } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ConfigService } from '../../../services/config.service';
import { NavigationService } from '../../../services/navigation.service';
import { ContentSection, Page, PageContent, PageView } from '../../../models/config/PageViews';
import { ContentRendererComponent } from '../../shared/renderer/content-renderer/content-renderer.component';
import { ScreenShellComponent } from '../../shared/layout/screen-shell/screen-shell.component';
import { PanelMenuComponent } from '../../shared/interfaces/panel-menu/panel-menu.component';
import { NotFoundScreen } from '../not-found-screen/not-found.screen';
import { TitleService } from '../../../services/title.service';

interface Match {
  page: Page;
  view: PageView | null;
}

@Component({
  selector: 'screen-page',
  imports: [
    PanelMenuModule,
    ContentRendererComponent,
    ScreenShellComponent,
    TranslocoDirective,
    PanelMenuComponent,
    NotFoundScreen,
  ],
  templateUrl: './page.screen.html',
})
export class PageScreen {
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly titleService: TitleService = inject(TitleService);
  private readonly configService: ConfigService = inject(ConfigService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  private readonly segments: Signal<string[]> = toSignal(
    this.route.url.pipe(map((segments: UrlSegment[]): string[] => segments.map((segment: UrlSegment): string => segment.path))),
    { initialValue: this.route.snapshot.url.map((segment: UrlSegment): string => segment.path) },
  );

  protected readonly pages: Signal<Page[]> = computed((): Page[] => this.configService.config().getPageViews().pages ?? []);
  protected readonly match: Signal<Match | null> = computed((): Match | null => this.findMatch(this.pages(), this.segments()));

  protected readonly page: Signal<Page | null> = computed((): Page | null => this.match()?.page ?? null);
  protected readonly view: Signal<PageView | null> = computed((): PageView | null => this.match()?.view ?? null);

  protected readonly hasMenu: Signal<boolean> = computed((): boolean => (this.page()?.views?.length ?? 0) > 0);
  protected readonly menuItems: Signal<MenuItem[]> = computed((): MenuItem[] => {
    const page: Page | null = this.page();
    return page?.views?.length ? this.getMenuItems(page.path, page.views) : [];
  });

  protected readonly activeContent: Signal<PageContent | null> = computed((): PageContent | null => {
    const view: PageView | null = this.view();
    if (view) return view.content ?? null;
    return this.page()?.content ?? null;
  });

  protected readonly mainContent: Signal<ContentSection[]> = computed((): ContentSection[] => this.activeContent()?.main ?? []);
  protected readonly asideContent: Signal<ContentSection[]> = computed((): ContentSection[] => this.activeContent()?.aside ?? []);

  public constructor() {
    effect((): void => {
      const match: Match | null = this.match();
      if (!match) return void this.navigationService.toNotFound();

      const target: string | null = this.findRedirectPath(match.page, match.view);
      if (target) return void this.navigationService.toPath(target);

      this.titleService.set(match.view?.title ?? match.page.title);
    });
  }

  private getMenuItems(parentPath: string, views: PageView[], level: number = 0): MenuItem[] {
    const currentPath: string = `/${this.segments().join('/')}`;

    return views.map((view: PageView): MenuItem => {
      const path: string = `/${parentPath}/${view.path}`;
      const hasChildren: boolean = (view.views?.length ?? 0) > 0;

      return {
        label: view.title,
        icon: view.icon,
        route: hasChildren ? undefined : path,
        expanded: hasChildren && (currentPath === path || currentPath.startsWith(`${path}/`)),
        items: hasChildren ? this.getMenuItems(`${parentPath}/${view.path}`, view.views ?? [], level + 1) : undefined,
        data: { level },
      };
    });
  }

  private findRedirectPath(page: Page, view: PageView | null): string | null {
    const currentPath: string = `/${this.segments().join('/')}`;

    if (!view) {
      const firstPath: string | null = this.findPath(page.path, page.views ?? []);
      return firstPath && firstPath !== currentPath ? firstPath : null;
    }

    const firstPath: string | null = this.findPath(currentPath.slice(1), view.views ?? []);
    return firstPath && firstPath !== currentPath ? firstPath : null;
  }

  private findPath(parentPath: string, views: PageView[]): string | null {
    const first: PageView | undefined = views.at(0);
    if (!first) return null;

    const path: string = `${parentPath}/${first.path}`;
    const hasChildren: boolean = (first.views?.length ?? 0) > 0;

    if (hasChildren) return this.findPath(path, first.views ?? []);
    return `/${path}`;
  }

  private findMatch(pages: Page[], segments: string[]): Match | null {
    const pagePath: string | undefined = segments.at(0);
    if (!pagePath) return null;

    const page: Page | undefined = pages.find((candidate: Page): boolean => candidate.path === pagePath);
    if (!page) return null;

    const viewSegments: string[] = segments.slice(1);
    const view: PageView | null = viewSegments.length > 0 ? this.findView(page.views ?? [], viewSegments) : null;
    if (viewSegments.length > 0 && !view) return null;

    return { page, view };
  }

  private findView(views: PageView[], segments: string[]): PageView | null {
    const currentPath: string | undefined = segments.at(0);
    if (!currentPath) return null;

    const view: PageView | undefined = views.find((candidate: PageView): boolean => candidate.path === currentPath);
    if (!view) return null;

    const rest: string[] = segments.slice(1);
    return rest.length === 0 ? view : this.findView(view.views ?? [], rest);
  }
}
