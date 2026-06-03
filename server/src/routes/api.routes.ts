import { Router } from "express";
import { ViewRoutes } from "./view.routes";
import { getConfig } from "../handlers/config/get-config";
import { getLanguage } from "../handlers/config/get-language";
import { ExpressUtils } from "../utils/ExpressUtils";
import { chains } from "./validators";

const router: Router = Router();

router.get("/config", getConfig);
router.get("/i18n/:language.json", chains.language, ExpressUtils.handleValidationResult, getLanguage);

router.use("/view", ViewRoutes);

export const ApiRoutes: Router = router;
