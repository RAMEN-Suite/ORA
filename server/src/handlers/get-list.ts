import { Utils } from '../utils/Utils';
import { Request, Response } from 'express';
import { STATUS_CODE } from '../constants/STATUS_CODE';
import { ListDAO } from '../database/ListDAO';
import { List, Listable, ListOptions, Pagination } from '../models/List';
import { matchedData } from 'express-validator';

export async function getList<T>(resource: Listable, req: Request, res: Response): Promise<void> {
  const params: Record<string, unknown> = matchedData(req);

  const specifiedLabel: string | undefined = Utils.parseString(params.label);
  const options: ListOptions = {
    orderBy: Utils.parseString(params.orderBy),
    asc: Utils.parseBoolean(params.asc),
    limit: Utils.parseNumber(params.limit) ?? 25,
    skip: Utils.parseNumber(params.skip) ?? 0,
    search: Utils.parseString(params.search),
  };

  const data: T[] = await ListDAO.getList(resource, specifiedLabel, options);
  const total: number = await ListDAO.getCount(resource, specifiedLabel, options);

  const pagination: Pagination = {
    skip: options.skip,
    limit: options.limit,
    count: data.length,
    total,
    hasNext: options.skip + data.length < total,
    hasPrevious: options.skip > 0,
  };
  const response: List<T> = { data, pagination };
  res.status(STATUS_CODE.OK).json(response);
}
