import { body } from "express-validator";
import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import checkRole from "../middleware/checkRoleMiddleware.js";
import UserController from "../controllers/userController.js";

const router = Router();

router.post(
  "/registration",
  [
    body("email").isEmail().withMessage("Некорректный email"),
    body("password").isLength({ min: 6 }).withMessage("Пароль должен содержать минимум 6 символов"),
    body("roleId").isNumeric().withMessage("Некорректный roleId"),
  ],
  UserController.registration,
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Некорректный email"),
    body("password").isLength({ min: 6 }).withMessage("Пароль должен содержать минимум 6 символов"),
  ],
  UserController.login,
);

router.get("/auth", authMiddleware, UserController.check);
router.get("/users", authMiddleware, UserController.allUsers);
router.put("/users/:id", authMiddleware, UserController.editUser);
router.delete("/users/:id", checkRole(2), UserController.deleteUser);

export default router;
