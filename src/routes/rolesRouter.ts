import { Router } from "express";
import rolesController from "../controllers/rolesController.js";
import checkRole from "../middleware/checkRoleMiddleware.js";

const router = Router();

router.post("/", checkRole(2), rolesController.createRole);
router.get("/", checkRole(2), rolesController.getAllRole);
router.get("/:id", checkRole(2), rolesController.getOneRole);
router.delete("/:id", checkRole(2), rolesController.deleteRole);

export default router;
