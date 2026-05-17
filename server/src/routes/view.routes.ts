import { Router } from "express";
import { ExpressUtils } from "../utils/ExpressUtils";
import { getList } from "../handlers/get-list";
import { getFacets } from "../handlers/get-facets";
import { chains } from "./validators";
import { getView } from "../handlers/get-view";
import { RESOURCE } from "../constants/RESOURCE";

const router: Router = Router();
const entities: Router = Router({ mergeParams: true });
const collections: Router = Router({ mergeParams: true });

router.use("/entities", entities);
router.use("/collections", collections);
router.use("/:uuid", chains.view, ExpressUtils.handleValidationResult, getView);

entities.get("/", chains.list, ExpressUtils.handleValidationResult, getList.bind(null, RESOURCE.ENTITY));
entities.get("/facets", chains.filter, ExpressUtils.handleValidationResult, getFacets.bind(null, RESOURCE.ENTITY));

collections.get("/", chains.list, ExpressUtils.handleValidationResult, getList.bind(null, RESOURCE.COLLECTION));
collections.get("/facets", chains.filter, ExpressUtils.handleValidationResult, getFacets.bind(null, RESOURCE.COLLECTION));

export const ViewRoutes: Router = router;
