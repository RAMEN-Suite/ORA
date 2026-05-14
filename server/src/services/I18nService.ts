import path from "node:path";
import fs from "fs/promises";
import { ServiceError } from "../models/utility/Error";
import { ERROR_CODE } from "../constants/ERROR_CODE";
import { logger } from "../utils/logger";

export type Translation = Record<string, unknown>;

export class I18nService {
  private static languagesPath: string | undefined;

  public static async initService(): Promise<void> {
    const languagesPath: string | undefined = process.env.LANGUAGES_PATH;
    if (!languagesPath) throw new ServiceError(ERROR_CODE.MISSING_ENV_VAR, "Missing LANGUAGES_PATH");

    this.languagesPath = path.resolve(process.cwd(), languagesPath);
    const isLanguagesAccessible: boolean = await this.exists(this.languagesPath);
    if (!isLanguagesAccessible) logger.warn({ path: this.languagesPath }, "I18nService: Are you missing out on languages?");
  }

  public static async fetchTranslation(lang: string): Promise<Translation> {
    if (!this.languagesPath) throw new ServiceError(ERROR_CODE.NOT_INITIALIZED, "I18nService not initialized");
    return await this.accessJSON(path.join(this.languagesPath, `${lang}.json`));
  }

  private static async readJSON(filePath: string): Promise<Translation> {
    const data: string = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as Translation;
  }

  private static async accessJSON(filePath: string): Promise<Translation> {
    const isAccessible: boolean = await this.exists(filePath);
    return isAccessible ? this.readJSON(filePath) : {};
  }

  private static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch (error: unknown) {
      logger.debug(error, "LanguageService: Failed to access.");
      return false;
    }
  }
}

export async function initI18nService(): Promise<void> {
  logger.info("I18nService: Initializing...");
  await I18nService.initService();
  logger.info("I18nService: Languages initialized.");
}
