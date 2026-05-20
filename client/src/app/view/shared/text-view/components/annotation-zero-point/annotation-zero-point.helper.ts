export interface AnnotationMarginPositionOptions {
  markerWidth: number;
  markerGap: number;
}

export class MarginPositionHelper {
  public static resolve(
    anchor: HTMLElement,
    marker: HTMLElement,
    options: AnnotationMarginPositionOptions,
  ): Record<string, string> | undefined {
    const root: HTMLElement | undefined = this.root(anchor);
    const content: HTMLElement | undefined = this.content(root);

    if (!root || !content) return undefined;

    const anchorBox: DOMRect = anchor.getBoundingClientRect();
    const markerBox: DOMRect = marker.getBoundingClientRect();
    const rootBox: DOMRect = root.getBoundingClientRect();
    const contentBox: DOMRect = content.getBoundingClientRect();

    const textLeft: number = contentBox.left - rootBox.left;
    const left: number = textLeft - options.markerWidth - options.markerGap;

    const anchorMiddle: number = anchorBox.top - rootBox.top + anchorBox.height / 2;
    const top: number = anchorMiddle - markerBox.height / 2;

    return {
      top: `${top}px`,
      left: `${left}px`,
      width: `${options.markerWidth}px`,
    };
  }

  public static root(anchor: HTMLElement): HTMLElement | undefined {
    return (anchor.closest('[data-text-view-root]') as HTMLElement | null) ?? undefined;
  }

  public static content(root: HTMLElement | undefined): HTMLElement | undefined {
    return (root?.querySelector('[data-text-view-content]') as HTMLElement | null) ?? undefined;
  }
}
