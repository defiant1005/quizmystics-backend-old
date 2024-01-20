import express from "express";
import categoriesRouter from "./categoriesRouter.js";
import questionsRouter from "./questionsRouter.js";
import userRouter from "./userRouter.js";
import rolesRouter from "./rolesRouter.js";

const router = express.Router();

router.use("/user", userRouter);
router.use("/category", categoriesRouter);
router.use("/question", questionsRouter);
router.use("/roles", rolesRouter);

export default router;
