import { Request, Response } from "express";
import { STATUS_CODE } from "../constants/STATUS_CODE";
import { Utils } from "../utils/Utils";
import { FacetGroup, FacetOptions } from "../models/Facet";
import { FacetDAO } from "../database/FacetDAO";
import { matchedData } from "express-validator";
import { FilterParser } from "../parser/FilterParser";
import { RESOURCE } from "../constants/RESOURCE";

export async function getFacets(resource: RESOURCE, req: Request, res: Response): Promise<void> {
  const params: Record<string, unknown> = matchedData(req);

  const specifiedLabel: string | undefined = Utils.parseString(params.label);
  const options: FacetOptions = {
    search: Utils.parseString(params.search),
    field: Utils.parseString(params.field),
    facets: Utils.parseStringArray(params.facets),
    filters: FilterParser.parseMany(Utils.parseStringArray(params.filters)),
  };

  const response: FacetGroup[] = await FacetDAO.getFacets(resource, specifiedLabel, options);
  res.status(STATUS_CODE.OK).json(response);
}
