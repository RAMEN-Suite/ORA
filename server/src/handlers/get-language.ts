import { Request, Response } from 'express';
import { I18nService, Translation } from '../services/I18nService';
import { matchedData } from 'express-validator';

export async function getLanguage(req: Request, res: Response): Promise<void> {
  const language: string = matchedData(req).language;
  const translation: Translation = await I18nService.fetchTranslation(language);
  res.status(200).json(translation);
}
