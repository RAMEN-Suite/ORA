import express, { Router } from "express";
import { ServiceError } from "../models/utility/Error";
import { ERROR_CODE } from "../constants/ERROR_CODE";
import { logger } from "../utils/logger";
import { FileUtils } from "../utils/FileUtils";
import { EnvironmentUtils } from "../utils/EnvironmentUtils";

export class ContentService {
  private static markdownPath: string | undefined;
  private static assetsPath: string | undefined;

  public static async initService(): Promise<void> {
    this.markdownPath = EnvironmentUtils.resolveEnvironmentPath("MARKDOWN_PATH");
    this.assetsPath = EnvironmentUtils.resolveEnvironmentPath("ASSETS_PATH");

    await FileUtils.requirePath(this.markdownPath);
    await FileUtils.requirePath(this.assetsPath);
  }

  public static attachContentRoutes(app: Router, mountPath: string = "/content"): void {
    if (!this.markdownPath || !this.assetsPath) {
      throw new ServiceError(ERROR_CODE.NOT_INITIALIZED, "ContentService not initialized");
    }

    app.use(`${mountPath}/markdown`, express.static(this.markdownPath));
    app.use(`${mountPath}/assets`, express.static(this.assetsPath));
    logger.info({ markdownPath: this.markdownPath, assetsPath: this.assetsPath }, "ContentService: Static content attached.");
  }
}

export async function initContentService(): Promise<void> {
  logger.info("ContentService: Initializing...");
  await ContentService.initService();
  logger.info("ContentService: Content initialized.");
}
