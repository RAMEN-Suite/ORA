import { Request, Response } from "express";
import { Config, ConfigService } from "../../services/ConfigService";
import { STATUS_CODE } from "../../constants/STATUS_CODE";

export async function getConfig(_: Request, res: Response): Promise<void> {
  const config: Config = await ConfigService.fetchConfig();
  res.status(STATUS_CODE.OK).send(config);
}
