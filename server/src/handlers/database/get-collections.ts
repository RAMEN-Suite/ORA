import { Request, Response } from 'express';
import { Nullable } from '../../types/global';
import { Collection } from '../../models/ramen/Collection';
import { CollectionDAO } from '../../repositories/CollectionDAO';
import { STATUS_CODE } from '../../constants/STATUS_CODE';

export async function getCollections(req: Request, res: Response): Promise<void> {
  const specificType: Nullable<string> = req.query.type as Nullable<string>;

  if (specificType) {
    const collections: Collection[] = await CollectionDAO.getTypedCollections(specificType);
    res.status(STATUS_CODE.OK).json(collections);
    return;
  }

  const collections: Collection[] = await CollectionDAO.getCollections();
  res.status(STATUS_CODE.OK).json(collections);
}
