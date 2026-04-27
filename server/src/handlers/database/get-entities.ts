import { Request, Response } from 'express';
import { EntityDAO } from '../../database/EntityDAO';
import { STATUS_CODE } from '../../constants/STATUS_CODE';
import { Nullable } from '../../types/global';
import { Utils } from '../../utils/Utils';
import { Options } from '../../models/utility/Options';
import { Entity } from '../../models/RAMEN';

export async function getEntities(req: Request, res: Response): Promise<void> {
  const specifiedType: Nullable<string> = Utils.parseString(req.query.type);
  const options: Options = {
    orderBy: Utils.parseString(req.query.orderBy),
    asc: Utils.parseBoolean(req.query.asc),
    limit: Utils.parseNumber(req.query.limit),
    skip: Utils.parseNumber(req.query.skip),
  };

  const entities: Entity[] = await EntityDAO.getEntities(specifiedType, options);
  res.status(STATUS_CODE.OK).json(entities);
}
