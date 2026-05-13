import { deepmerge, deepmergeCustom } from 'deepmerge-ts';

type IdentifiableRecord = Record<string, unknown> & { key?: string; id?: string };

export class ConfigUtils {
  public static readonly merge = deepmergeCustom({
    mergeArrays(values): readonly unknown[] {
      return values.reduce((merged: unknown[], current: readonly unknown[]): unknown[] => {
        return ConfigUtils.mergeArray(merged, current);
      }, []);
    },
  });

  private static mergeArray(base: readonly unknown[], override: readonly unknown[]): unknown[] {
    const merged: unknown[] = [...base];
    const indexByIdentity: Map<string, number> = new Map<string, number>();

    for (const [index, item] of merged.entries()) {
      const identity: string | undefined = ConfigUtils.identity(item);
      if (identity) indexByIdentity.set(identity, index);
    }

    for (const item of override) {
      const identity: string | undefined = ConfigUtils.identity(item);
      if (!identity) {
        merged.push(item);
        continue;
      }

      const index: number | undefined = indexByIdentity.get(identity);
      if (index === undefined) {
        indexByIdentity.set(identity, merged.length);
        merged.push(item);
        continue;
      }

      merged[index] = deepmerge(merged[index], item);
    }

    return merged;
  }

  private static identity(value: unknown): string | undefined {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return undefined;
    }

    const record = value as IdentifiableRecord;
    return record.key ?? record.id;
  }
}
