export type MarginPositionStyle = Partial<Record<'top' | 'left' | 'width', string>>;

export interface MarginPositionOptions {
  markerWidth: number;
  markerGap: number;
}

export class MarginPositionUtils {
  public static resolve(
    anchor: HTMLElement,
    marker: HTMLElement,
    options: MarginPositionOptions,
  ): MarginPositionStyle | undefined {
    const root: HTMLElement | undefined = this.root(anchor);
    const content: HTMLElement | undefined = root ? this.content(root) : undefined;
    if (!root || !content) return undefined;

    const anchorBox: DOMRect = anchor.getBoundingClientRect();
    const markerBox: DOMRect = marker.getBoundingClientRect();
    const rootBox: DOMRect = root.getBoundingClientRect();
    const contentBox: DOMRect = content.getBoundingClientRect();

    const left: number = contentBox.left - rootBox.left - options.markerWidth - options.markerGap;
    const top: number = anchorBox.top - rootBox.top + anchorBox.height / 2 - markerBox.height / 2;
    return { top: `${String(top)}px`, left: `${String(left)}px`, width: `${String(options.markerWidth)}px` };
  }

  public static root(anchor: HTMLElement): HTMLElement | undefined {
    const element: Element | null = anchor.closest('[data-text-view-root]');
    return element instanceof HTMLElement ? element : undefined;
  }

  private static content(root: HTMLElement): HTMLElement | undefined {
    const element: Element | null = root.querySelector('[data-text-view-content]');
    return element instanceof HTMLElement ? element : undefined;
  }
}
