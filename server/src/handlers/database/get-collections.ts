import { Request, Response } from 'express';
import { Nullable } from '../../types/global';
import { Collection } from '../../models/ramen/Collection';
import { CollectionDAO } from '../../repositories/CollectionDAO';
import { STATUS_CODE } from '../../constants/STATUS_CODE';
import { ListOptions } from '../../models/utility/Options';
import { Utils } from '../../utils/Utils';

export async function getCollections(req: Request, res: Response): Promise<void> {
  const specifiedNode: Nullable<string> = Utils.parseString(req.query.node);
  const options: ListOptions = {
    orderBy: Utils.parseString(req.query.orderBy),
    asc: Utils.parseBoolean(req.query.asc),
    limit: Utils.parseNumber(req.query.limit),
    skip: Utils.parseNumber(req.query.skip),
  };

  const collections: Collection[] = await CollectionDAO.getCollections(specifiedNode, options);
  res.status(STATUS_CODE.OK).json(collections);
}
