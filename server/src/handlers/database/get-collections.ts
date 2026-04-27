import { Request, Response } from 'express';
import { Nullable } from '../../types/global';
import { CollectionDAO } from '../../database/CollectionDAO';
import { STATUS_CODE } from '../../constants/STATUS_CODE';
import { Options } from '../../models/utility/Options';
import { Utils } from '../../utils/Utils';
import { Collection } from '../../models/RAMEN';

export async function getCollections(req: Request, res: Response): Promise<void> {
  const specifiedType: Nullable<string> = Utils.parseString(req.query.type);
  const options: Options = {
    orderBy: Utils.parseString(req.query.orderBy),
    asc: Utils.parseBoolean(req.query.asc),
    limit: Utils.parseNumber(req.query.limit),
    skip: Utils.parseNumber(req.query.skip),
  };

  const collections: Collection[] = await CollectionDAO.getCollections(specifiedType, options);
  res.status(STATUS_CODE.OK).json(collections);
}
