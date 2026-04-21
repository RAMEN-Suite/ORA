import { ListOptions } from '../models/utility/Options';

export class CypherUtils {
  public static getListQuery(alias: string, options: ListOptions): string {
    const query: string[] = [];
    if (options.orderBy) query.push(`ORDER BY ${alias}.${options.orderBy}`);
    if (options.asc !== undefined) query.push(options.asc ? `ASC` : `DESC`);
    if (options.skip !== undefined) query.push(`SKIP ${options.skip}`);
    if (options.limit !== undefined) query.push(`LIMIT ${options.limit}`);
    return query.join(' ');
  }
}
