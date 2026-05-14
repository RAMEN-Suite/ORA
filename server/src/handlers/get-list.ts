import { Utils } from "../utils/Utils";
import { Request, Response } from "express";
import { STATUS_CODE } from "../constants/STATUS_CODE";
import { ListDAO } from "../database/ListDAO";
import { List, ListOptions, Pagination } from "../models/List";
import { matchedData } from "express-validator";
import { FilterParser } from "../parser/FilterParser";
import { Resource } from "../models/RAMEN";

export async function getList(resource: Resource, req: Request, res: Response): Promise<void> {
  const query: Record<string, unknown> = matchedData(req);

  const specifiedLabel: string | undefined = Utils.parseString(query.label);
  const options: ListOptions = {
    orderBy: Utils.parseString(query.orderBy),
    asc: Utils.parseBoolean(query.asc),
    limit: Utils.parseNumber(query.limit) ?? 25,
    skip: Utils.parseNumber(query.skip) ?? 0,
    search: Utils.parseString(query.search),
    field: Utils.parseString(query.field),
    filters: FilterParser.parseMany(Utils.parseStringArray(query.filters)),
  };

  const data: unknown[] = await ListDAO.getList(resource, specifiedLabel, options);
  const total: number = await ListDAO.getCount(resource, specifiedLabel, options);

  const pagination: Pagination = {
    skip: options.skip,
    limit: options.limit,
    count: data.length,
    total,
    hasNext: options.skip + data.length < total,
    hasPrevious: options.skip > 0,
  };
  const response: List<unknown> = { data, pagination };
  res.status(STATUS_CODE.OK).json(response);
}
