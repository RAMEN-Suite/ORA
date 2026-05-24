import { DestroyRef, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { BlockPathResolver } from '../../../../resolvers/block-path.resolver';
import { AnnotationDialog } from '../../../../models/config/Annotations';
import { InlineAnnotation } from '../../../../models/TextAnnotation';
import { ViewResponse, ViewService } from '../../../../services/view.service';

@Injectable()
export class AnnotationDialogController {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly viewService: ViewService = inject(ViewService);

  public readonly isLoading: WritableSignal<boolean> = signal(false);
  public readonly hasError: WritableSignal<boolean> = signal(false);
  public readonly currentAnnotations: WritableSignal<InlineAnnotation[]> = signal<InlineAnnotation[]>([]);
  public readonly viewMap: WritableSignal<Record<string, ViewResponse | undefined>> = signal({});

  public async load(annotations: InlineAnnotation[]): Promise<boolean> {
    if (annotations.length === 0 || this.isLoading()) return false;

    this.currentAnnotations.set(annotations);
    this.isLoading.set(true);
    this.hasError.set(false);

    try {
      this.viewMap.set(await this.resolveViews(annotations));
    } catch {
      this.hasError.set(true);
    } finally {
      this.isLoading.set(false);
    }

    return true;
  }

  private async resolveViews(annotations: InlineAnnotation[]): Promise<Record<string, ViewResponse | undefined>> {
    const result: Record<string, ViewResponse | undefined> = {};

    for (const annotation of annotations) {
      result[annotation.uuid] = await this.fetchView(annotation);
    }

    return result;
  }

  private async fetchView(annotation: InlineAnnotation): Promise<ViewResponse | undefined> {
    const dialog: AnnotationDialog | undefined = annotation.definition.dialog;
    const paths: string[] = BlockPathResolver.resolvePaths(dialog);

    for (const description of dialog?.description ?? []) {
      const path: string | undefined = description.annotations?.path.trim();
      if (path) paths.push(path);
    }

    const uniquePaths: string[] = Array.from(new Set(paths)).sort();
    if (uniquePaths.length === 0) return undefined;

    return await firstValueFrom(
      this.viewService.fetchViewOnce(annotation.uuid, uniquePaths).pipe(takeUntilDestroyed(this.destroyRef)),
    );
  }
}
