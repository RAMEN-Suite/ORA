import { Request, Response } from "express";
import { matchedData } from "express-validator";
import { Utils } from "../../utils/Utils";
import { STATUS_CODE } from "../../constants/STATUS_CODE";
import { Node } from "../../models/Node";
import { ViewDAO } from "../../database/ViewDAO";

export async function getView(req: Request, res: Response): Promise<void> {
  const params: Record<string, unknown> = matchedData(req);
  const uuid: string | undefined = Utils.parseString(params.uuid);
  if (!uuid) return void res.status(STATUS_CODE.BAD_REQUEST).send();

  const paths: string[] = Utils.parseStringArray(params.paths);
  const node: Node | null = await ViewDAO.fetchNode(uuid);

  if (!node) return void res.status(STATUS_CODE.NOT_FOUND).send();
  if (paths.length === 0) return void res.status(STATUS_CODE.OK).json({ node });

  const values: Record<string, unknown> = await ViewDAO.fetchValues(uuid, paths);
  res.status(STATUS_CODE.OK).json({ node, values });
}
