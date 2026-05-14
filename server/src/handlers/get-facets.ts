import { Request, Response } from "express";
import { STATUS_CODE } from "../constants/STATUS_CODE";
import { Utils } from "../utils/Utils";
import { FacetGroup, FacetOptions } from "../models/Facet";
import { FacetDAO } from "../database/FacetDAO";
import { matchedData } from "express-validator";
import { FilterParser } from "../parser/FilterParser";
import { Resource } from "../models/RAMEN";

export async function getFacets(resource: Resource, req: Request, res: Response): Promise<void> {
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
