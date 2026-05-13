import { Request, Response } from "express";
import { STATUS_CODE } from "../constants/STATUS_CODE";
import { Listable } from "../models/List";
import { Utils } from "../utils/Utils";
import { FacetGroup, FacetOptions } from "../models/Facet";
import { FacetDAO } from "../database/FacetDAO";
import { matchedData } from "express-validator";
import { FilterParser } from "../helper/parser/FilterParser";

export async function getFacets(resource: Listable, req: Request, res: Response): Promise<void> {
  const queries: Record<string, unknown> = matchedData(req);

  const specifiedLabel: string | undefined = Utils.parseString(queries.label);
  const options: FacetOptions = {
    search: Utils.parseString(queries.search),
    field: Utils.parseString(queries.field),
    facets: Utils.parseStringArray(queries.facets),
    filters: FilterParser.parseMany(Utils.parseStringArray(queries.filters)),
  };

  const response: FacetGroup[] = await FacetDAO.getFacets(resource, specifiedLabel, options);
  res.status(STATUS_CODE.OK).json(response);
}
