import { Router } from "express";
import { ExpressUtils } from "../utils/ExpressUtils";
import { getList } from "../handlers/get-list";
import { getFacets } from "../handlers/get-facets";
import { chains } from "./validators";
import { Resource } from "../models/RAMEN";

const router: Router = Router();
const entities: Router = Router({ mergeParams: true });
const collections: Router = Router({ mergeParams: true });

router.use("/entities", entities);
router.use("/collections", collections);
router.use("/:uuid", chains.view);

entities.get("/", chains.list, ExpressUtils.handleValidationResult, getList.bind(null, Resource.ENTITY));
entities.get("/facets", chains.filter, ExpressUtils.handleValidationResult, getFacets.bind(null, Resource.ENTITY));

collections.get("/", chains.list, ExpressUtils.handleValidationResult, getList.bind(null, Resource.COLLECTION));
collections.get("/facets", chains.filter, ExpressUtils.handleValidationResult, getFacets.bind(null, Resource.COLLECTION));

export const ViewRoutes: Router = router;
