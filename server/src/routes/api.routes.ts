import { Router } from "express";
import { ViewRoutes } from "./view.routes";
import { getConfig } from "../handlers/get-config";
import { getLanguage } from "../handlers/get-language";
import { ExpressUtils } from "../utils/ExpressUtils";
import { param } from "express-validator";
import { REGEXP } from "../constants/REGEXP";

const router: Router = Router();

router.get("/config", getConfig);
router.get("/i18n/:language.json", param("language").matches(REGEXP.LANGUAGE), ExpressUtils.handleValidationResult, getLanguage);

router.use("/view/", ViewRoutes);

export const ApiRoutes: Router = router;
