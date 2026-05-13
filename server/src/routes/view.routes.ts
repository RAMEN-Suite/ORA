import { Router } from "express";
import { ExpressUtils } from "../utils/ExpressUtils";
import { getList } from "../handlers/get-list";
import { Listable } from "../models/List";
import { getFacets } from "../handlers/get-facets";
import { chains } from "./validators";

const router: Router = Router();
const entities: Router = Router({ mergeParams: true });
const collections: Router = Router({ mergeParams: true });

router.use("/entities", entities);
router.use("/collections", collections);

entities.get("/", chains.list, ExpressUtils.handleValidationResult, getList.bind(null, Listable.ENTITY));
entities.get("/facets", chains.filter, ExpressUtils.handleValidationResult, getFacets.bind(null, Listable.ENTITY));

collections.get("/", chains.list, ExpressUtils.handleValidationResult, getList.bind(null, Listable.COLLECTION));
collections.get("/facets", chains.filter, ExpressUtils.handleValidationResult, getFacets.bind(null, Listable.COLLECTION));

export const ViewRoutes: Router = router;
