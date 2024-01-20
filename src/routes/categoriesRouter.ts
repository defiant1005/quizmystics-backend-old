import express from "express";
import categoriesController from "../controllers/categoriesController.js";
import checkRole from "../middleware/checkRoleMiddleware.js";

const router = express.Router();

router.post("/", checkRole(2), categoriesController.createCategory);
router.get("/", categoriesController.getAllCategories);
router.put("/:id", categoriesController.editCategory);
router.delete("/:id", checkRole(2), categoriesController.deleteCategory);

export default router;
