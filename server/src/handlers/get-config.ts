import { Request, Response } from 'express';
import { ConfigService, JSON } from '../services/ConfigService';

export async function getConfig(_: Request, res: Response): Promise<void> {
  const config: JSON = await ConfigService.fetchConfig();
  res.status(200).send(config);
}
