import { Request, Response } from 'express';
import { STATUS_CODE } from '../constants/STATUS_CODE';
import { Listable } from '../models/List';
import { Utils } from '../utils/Utils';
import { FacetGroup, FacetOptions } from '../models/Facet';
import { FacetDAO } from '../database/FacetDAO';
import { matchedData } from 'express-validator';

export async function getFacets(resource: Listable, req: Request, res: Response): Promise<void> {
  const params: Record<string, unknown> = matchedData(req);

  const specifiedLabel: string | undefined = Utils.parseString(params.label);
  const options: FacetOptions = {
    field: Utils.parseString(params.field),
    search: Utils.parseString(params.search),
    filters: Utils.parseStringArray(params.filters),
  };

  const response: FacetGroup[] = await FacetDAO.getFacets(resource, specifiedLabel, options);
  res.status(STATUS_CODE.OK).json(response);
}
