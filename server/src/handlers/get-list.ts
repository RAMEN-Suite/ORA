import { Utils } from '../utils/Utils';
import { Request, Response } from 'express';
import { STATUS_CODE } from '../constants/STATUS_CODE';
import { ListDAO } from '../database/ListDAO';
import { List, Listable, ListOptions, Pagination } from '../models/List';

export async function getList<T>(resource: Listable, req: Request, res: Response): Promise<void> {
  const specifiedLabel: string | undefined = Utils.parseString(req.query.label);
  const options: ListOptions = {
    orderBy: Utils.parseString(req.query.orderBy),
    asc: Utils.parseBoolean(req.query.asc),
    limit: Utils.parseNumber(req.query.limit) ?? 25,
    skip: Utils.parseNumber(req.query.skip) ?? 0,
    search: Utils.parseString(req.query.search),
    field: Utils.parseString(req.query.field),
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
