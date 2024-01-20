import { Router } from "express";
import questionsController from "../controllers/questionsController.js";
import checkRole from "../middleware/checkRoleMiddleware.js";

const router = Router();

router.post("/", checkRole(2), questionsController.createQuestion);
router.post("/check-answer/:id", questionsController.checkAnswer);
router.get("/", questionsController.getAllQuestion);
router.get("/:id", questionsController.getOneQuestion);
router.put("/:id", questionsController.editQuestion);
router.delete("/:id", checkRole(2), questionsController.deleteQuestion);

export default router;
