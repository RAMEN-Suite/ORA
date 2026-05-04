import { ServiceError } from '../models/utility/Error';
import { ERROR_CODE } from '../constants/ERROR_CODE';
import { logger } from '../utils/logger';
import path from 'node:path';
import fs from 'fs/promises';
import screens from '../../config/screens.config.json';
import { Config } from '../models/Config';
import { deepmerge } from 'deepmerge-ts';

export type JSON = Record<string, unknown>;

const DEFAULT_CONFIG: Config.Root = { screens };
const CONFIG_FILES: string[] = ['screens.config.json', 'layout.config.json'];

export class ConfigService {
  private static overridesPath: string | undefined;

  public static async initService(): Promise<void> {
    const overridesPath: string | undefined = process.env.OVERRIDES_PATH;
    if (!overridesPath) throw new ServiceError(ERROR_CODE.MISSING_ENV_VAR, 'Missing OVERRIDES_PATH');
    this.overridesPath = path.resolve(process.cwd(), overridesPath);

    const isOverrideAccessible: boolean = await this.exists(this.overridesPath);
    if (!isOverrideAccessible) logger.warn({ path: this.overridesPath }, 'ConfigService: Are you missing overrides?');
  }

  public static async fetchConfig(): Promise<JSON> {
    if (!this.overridesPath) throw new ServiceError(ERROR_CODE.NOT_INITIALIZED, 'ConfigService not initialized');
    const config: JSON = { ...DEFAULT_CONFIG };

    for (const file of CONFIG_FILES) {
      const key: string = file.replace('.config.json', '');
      const override: JSON = await this.accessJSON(path.join(this.overridesPath, file));
      config[key] = deepmerge(config[key], override);
    }

    return config;
  }

  private static async readJSON(filePath: string): Promise<JSON> {
    const data: string = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  }

  private static async accessJSON(filePath: string): Promise<JSON> {
    const isAccessible: boolean = await this.exists(filePath);
    return isAccessible ? this.readJSON(filePath) : {};
  }

  private static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch (error: unknown) {
      logger.warn(error, 'ConfigService: Failed to access.');
      return false;
    }
  }
}

export async function initConfigService(): Promise<void> {
  logger.info('ConfigService: Initializing...');
  await ConfigService.initService();
  logger.info('ConfigService: Configuration initialized.');
}
