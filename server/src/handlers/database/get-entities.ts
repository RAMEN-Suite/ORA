import { Request, Response } from 'express';
import { Entity } from '../../models/ramen/Entity';
import { EntityDAO } from '../../repositories/EntityDAO';
import { STATUS_CODE } from '../../constants/STATUS_CODE';
import { Nullable } from '../../types/global';

export async function getEntities(req: Request, res: Response): Promise<void> {
  const specifiedType: Nullable<string> = req.query.type as Nullable<string>;

  if (specifiedType) {
    const entities: Entity[] = await EntityDAO.getTypedEntities(specifiedType);
    res.status(STATUS_CODE.OK).json(entities);
    return;
  }

  const entities: Entity[] = await EntityDAO.getEntities();
  res.status(STATUS_CODE.OK).json(entities);
}
