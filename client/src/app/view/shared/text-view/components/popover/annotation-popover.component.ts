import {
  Component,
  computed,
  DestroyRef,
  forwardRef,
  inject,
  input,
  InputSignal,
  signal,
  Signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, forkJoin, map, Observable, of, tap } from 'rxjs';
import { Popover } from 'primeng/popover';
import { BlockPathResolver } from '../../../../../resolvers/block-path.resolver';
import { ViewResponse, ViewService } from '../../../../../services/view.service';
import { InlineAnnotation } from '../../models/TextAnnotation';
import { ActivateDirective } from '../../../../../directives/activate.directive';
import { AnnotationPopoverContentComponent } from './annotation-popover-content.component';

export type PopoverResponses = Record<string, ViewResponse | undefined>;

interface PopoverResponseEntry {
  uuid: string;
  response?: ViewResponse;
}

@Component({
  selector: 'annotation-popover',
  imports: [Popover, ActivateDirective, forwardRef(() => AnnotationPopoverContentComponent)],
  templateUrl: './annotation-popover.component.html',
  host: { class: 'contents' },
})
export class AnnotationPopoverComponent {
  private readonly viewService: ViewService = inject(ViewService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  public readonly classes: InputSignal<string> = input<string>('');
  public readonly annotations: InputSignal<InlineAnnotation[]> = input<InlineAnnotation[]>([]);

  private readonly popoverComponent: Signal<Popover | undefined> = viewChild(Popover);

  protected readonly isPopoverOpen: WritableSignal<boolean> = signal(false);
  protected readonly isLoadingPopover: WritableSignal<boolean> = signal(false);

  protected readonly activeItems: WritableSignal<InlineAnnotation[]> = signal<InlineAnnotation[]>([]);
  protected readonly responses: WritableSignal<PopoverResponses> = signal<PopoverResponses>({});

  protected readonly hasPopover: Signal<boolean> = computed((): boolean => this.popoverItems().length > 0);
  protected readonly popoverItems: Signal<InlineAnnotation[]> = computed((): InlineAnnotation[] => {
    return this.annotations().filter((a: InlineAnnotation): boolean => a.definition.behavior === 'popover');
  });

  protected readonly hostClasses: Signal<string> = computed((): string => {
    const classes: string[] = [this.classes()];

    if (this.hasPopover()) classes.push('cursor-pointer');
    if (this.isLoadingPopover()) classes.push('cursor-wait');

    return classes.filter(Boolean).join(' ');
  });

  protected handleOpenPopover(event: Event): void {
    if (!this.hasPopover()) return;
    if (this.isLoadingPopover()) return;

    event.preventDefault();
    event.stopPropagation();

    const items: InlineAnnotation[] = this.popoverItems();
    if (items.length === 0) return;

    this.activeItems.set(items);
    this.loadContents(items).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(this.showPopover.bind(this, event));
  }

  protected handleHidePopover(): void {
    this.isPopoverOpen.set(false);
  }

  private loadContents(annotations: InlineAnnotation[]): Observable<void> {
    const requests: InlineAnnotation[] = annotations.filter((annotation: InlineAnnotation): boolean => {
      return BlockPathResolver.resolvePaths(annotation.definition.popover).length > 0;
    });

    if (requests.length === 0) {
      this.responses.set({});
      return of(undefined);
    }

    this.isLoadingPopover.set(true);
    return forkJoin(requests.map(this.loadContent.bind(this))).pipe(
      tap((entries: PopoverResponseEntry[]): void => this.responses.set(this.toResponses(entries))),
      finalize((): void => this.isLoadingPopover.set(false)),
      map((): void => undefined),
    );
  }

  private loadContent(annotation: InlineAnnotation): Observable<PopoverResponseEntry> {
    const paths: string[] = BlockPathResolver.resolvePaths(annotation.definition.popover);

    return this.viewService.fetchViewOnce(annotation.uuid, paths).pipe(
      map((response: ViewResponse): PopoverResponseEntry => ({ uuid: annotation.uuid, response })),
      catchError((): Observable<PopoverResponseEntry> => of({ uuid: annotation.uuid })),
    );
  }

  private toResponses(entries: PopoverResponseEntry[]): PopoverResponses {
    const responses: PopoverResponses = {};
    for (const entry of entries) responses[entry.uuid] = entry.response;
    return responses;
  }

  private showPopover(event: Event): void {
    this.isPopoverOpen.set(true);
    this.popoverComponent()?.show(event);
  }
}
