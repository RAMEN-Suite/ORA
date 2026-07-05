import { Request, Response } from 'express';
import { I18nService, Translation } from '../../services/I18nService';
import { matchedData } from 'express-validator';
import { Utils } from '../../utils/Utils';
import { STATUS_CODE } from '../../constants/STATUS_CODE';

export async function getLanguage(req: Request, res: Response): Promise<void> {
  const language: string | undefined = Utils.parseString(matchedData(req).language) ?? '';
  const translation: Translation = await I18nService.fetchTranslation(language);
  res.status(STATUS_CODE.OK).json(translation);
}
