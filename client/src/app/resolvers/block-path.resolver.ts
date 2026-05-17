import { Access } from '../models/config/Access';

export class BlockPathResolver {
  public static resolve(value: unknown): string[] {
    const paths: Set<string> = new Set<string>();
    this.collect(value, paths);
    return Array.from(paths).sort();
  }
  private static collect(value: unknown, paths: Set<string>): void {
    if (this.isAccess(value)) return void paths.add(value.path);
    if (Array.isArray(value)) return value.forEach((item: unknown): void => this.collect(item, paths));

    if (typeof value === 'object' && value !== null) {
      Object.values(value).forEach((item: unknown): void => this.collect(item, paths));
    }
  }

  private static isAccess(value: unknown): value is Access {
    return typeof value === 'object' && value !== null && 'path' in value && typeof value.path === 'string';
  }
}
