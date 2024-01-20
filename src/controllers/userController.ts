import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { Secret } from "jsonwebtoken";
import { validationResult } from "express-validator";
import ApiError from "../error/ApiError.js";
import { User } from "../models/models.js";

const generateJwt = (id: number, email: string, roleId: number): string =>
  jwt.sign({ id, email, roleId }, process.env.SECRET_KEY as Secret, { expiresIn: "24h" });

class UserController {
  private handleError(res: Response, error: unknown, defaultMessage: string): Response {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    } else {
      return res.status(500).json({ message: defaultMessage });
    }
  }

  async registration(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.json(ApiError.badRequest(errors.array()[0].msg));
      }

      const { email, password, roleId } = req.body;
      const candidate = await User.findOne({ where: { email } });

      if (candidate) {
        return res.json(ApiError.badRequest("Пользователь с таким email уже существует"));
      }

      const hashPassword = await bcrypt.hash(password, 5);
      const user = await User.create({ email, roleId, password: hashPassword });
      const token = generateJwt(user.id!, user.email, user.roleId!);

      return res.json({ token });
    } catch (error) {
      return this.handleError(res, error, "Internal Server Error");
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.json(ApiError.badRequest(errors.array()[0].msg));
      }

      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.json(ApiError.badRequest("Пользователь с таким email не найден"));
      }

      const comparePassword = bcrypt.compareSync(password, user.password);

      if (!comparePassword) {
        return res.json(ApiError.badRequest("Неверный логин или пароль"));
      }
      const token = generateJwt(user.id!, user.email, user.roleId!);
      return res.json({ token });
    } catch (error) {
      return this.handleError(res, error, "Internal Server Error");
    }
  }

  async check(req: any, res: Response): Promise<Response> {
    try {
      const token = generateJwt(req.user.id, req.user.email, req.user.roleId);
      return res.json({ token });
    } catch (error) {
      return this.handleError(res, error, "Internal Server Error");
    }
  }

  async allUsers(req: Request, res: Response): Promise<Response> {
    try {
      const users = await User.findAll();
      return res.json(
        users.map((user) => {
          return {
            email: user.email,
            id: user.id,
            roleId: user.roleId,
          };
        }),
      );
    } catch (error) {
      return this.handleError(res, error, "Internal Server Error");
    }
  }

  async editUser(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { email, roleId } = req.body;
      const user = await User.findOne({
        where: { id },
      });

      if (!user) {
        return res.json(ApiError.badRequest("Пользователь не найден"));
      }

      if (!email || !roleId) {
        return res.json(ApiError.badRequest("Некорректный email или roleId"));
      }

      user.set({
        email: email,
        roleId: roleId,
      });

      await user.save();

      return res.json({ message: "ok" });
    } catch (error) {
      return this.handleError(res, error, "Internal Server Error");
    }
  }

  async deleteUser(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const user = await User.findOne({
        where: { id },
      });

      if (!user) {
        return res.json(ApiError.badRequest("Пользователь не найден"));
      }

      await user.destroy();
      return res.json({ message: "ok" });
    } catch (e) {
      return this.handleError(res, e, "Internal Server Error");
    }
  }
}

export default new UserController();
