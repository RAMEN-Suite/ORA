import { ParseUtils } from './ParseUtils';

export const PAGE_LIMITS = [25, 50, 100] as const;
export type PageLimit = (typeof PAGE_LIMITS)[number];

export class PaginationUtils {
  public static parseLimit(value: unknown, fallback: PageLimit = 25): PageLimit {
    const limit: number | undefined = ParseUtils.parseNumber(value);
    if (limit === undefined || limit <= 0) return fallback;

    return PAGE_LIMITS.reduce((closest: PageLimit, current: PageLimit): PageLimit => {
      return Math.abs(current - limit) < Math.abs(closest - limit) ? current : closest;
    });
  }

  public static parsePage(value: unknown, fallback: number = 1): number {
    const page: number | undefined = ParseUtils.parseNumber(value);
    return page !== undefined && Number.isInteger(page) && page > 0 ? page : fallback;
  }

  public static pageToSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  public static skipToPage(skip: number, limit: number): number {
    return Math.floor(skip / limit) + 1;
  }
}
