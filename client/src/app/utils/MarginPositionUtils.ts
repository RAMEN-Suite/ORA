export type MarginPositionStyle = Partial<Record<'top' | 'left' | 'width', string>>;

export interface MarginPositionOptions {
  width: number;
  gap: number;
}

export class MarginPositionUtils {
  public static resolve(
    anchor: HTMLElement,
    marker: HTMLElement,
    root: HTMLElement,
    content: HTMLElement,
    options: MarginPositionOptions,
  ): MarginPositionStyle {
    const anchorBox: DOMRect = anchor.getBoundingClientRect();
    const markerBox: DOMRect = marker.getBoundingClientRect();
    const rootBox: DOMRect = root.getBoundingClientRect();
    const contentBox: DOMRect = content.getBoundingClientRect();

    const top: number = anchorBox.top - rootBox.top + anchorBox.height / 2 - markerBox.height / 2;
    const left: number = contentBox.left - rootBox.left - options.width - options.gap;

    return {
      top: `${top}px`,
      left: `${left}px`,
      width: `${options.width}px`,
    };
  }

  public static root(anchor: HTMLElement, selector: string): HTMLElement | undefined {
    const element: Element | null = anchor.closest(selector);
    return element instanceof HTMLElement ? element : undefined;
  }

  public static content(root: HTMLElement, selector: string): HTMLElement | undefined {
    const element: Element | null = root.querySelector(selector);
    return element instanceof HTMLElement ? element : undefined;
  }
}
