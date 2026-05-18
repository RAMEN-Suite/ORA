import { Binding } from '../models/config/Config';

export class BlockPathResolver {
  public static resolvePaths(value: unknown): string[] {
    const paths: Set<string> = new Set<string>();
    this.collectPaths(value, paths);
    return Array.from(paths).sort();
  }

  private static collectPaths(value: unknown, paths: Set<string>): void {
    if (this.isBinding(value)) return void paths.add(value.path);
    if (Array.isArray(value)) return value.forEach((item: unknown): void => this.collectPaths(item, paths));

    if (typeof value === 'object' && value !== null) {
      Object.values(value).forEach((item: unknown): void => this.collectPaths(item, paths));
    }
  }

  private static isBinding(value: unknown): value is Binding {
    return typeof value === 'object' && value !== null && 'path' in value && typeof value.path === 'string';
  }
}
