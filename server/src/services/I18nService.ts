import path from 'node:path';
import { ServiceError } from '../models/utility/Error';
import { ERROR_CODE } from '../constants/ERROR_CODE';
import { logger } from '../utils/logger';
import { FileUtils, JSONObject } from '../utils/FileUtils';
import { EnvironmentUtils } from '../utils/EnvironmentUtils';

export type Translation = JSONObject;

export class I18nService {
  private static languagesPath: string | undefined;

  public static async initService(): Promise<void> {
    this.languagesPath = EnvironmentUtils.resolveEnvironmentPath('LANGUAGES_PATH');
    const isLanguagesAccessible: boolean = await FileUtils.exists(this.languagesPath);
    if (!isLanguagesAccessible) logger.warn({ path: this.languagesPath }, 'I18nService: Are you missing languages?');
  }

  public static async fetchTranslation(lang: string): Promise<Translation> {
    if (!this.languagesPath) throw new ServiceError(ERROR_CODE.NOT_INITIALIZED, 'I18nService not initialized');
    return FileUtils.accessJSON<Translation>(path.join(this.languagesPath, `${lang}.json`));
  }
}

export async function initI18nService(): Promise<void> {
  logger.info('I18nService: Initializing...');
  await I18nService.initService();
  logger.info('I18nService: Languages initialized.');
}
