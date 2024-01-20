import { Request, Response, NextFunction } from "express";
import { Role } from "../models/models.js";
import ApiError from "../error/ApiError.js";

class RolesController {
  private handleError(res: Response, error: unknown, defaultMessage: string): Response {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    } else {
      return res.status(500).json({ message: defaultMessage });
    }
  }

  async createRole(req: Request, res: Response): Promise<Response> {
    try {
      const { role } = req.body;
      const newRole = await Role.create({ role });
      return res.json(newRole);
    } catch (error) {
      return this.handleError(res, error, "Произошла непредвиденная ошибка");
    }
  }

  async getAllRole(req: Request, res: Response): Promise<Response> {
    try {
      const roles = await Role.findAll();
      return res.json(
        roles.map((role) => {
          return {
            id: role.id,
            role: role.role,
          };
        }),
      );
    } catch (error) {
      return this.handleError(res, error, "Произошла непредвиденная ошибка");
    }
  }

  async getOneRole(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const role = await Role.findOne({
        where: { id },
      });
      return res.json(role);
    } catch (error) {
      return this.handleError(res, error, "Произошла непредвиденная ошибка");
    }
  }

  async deleteRole(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const { id } = req.params;
      const role = await Role.findOne({
        where: { id },
      });
      if (role) {
        await role.destroy();
      } else {
        return res.json(ApiError.badRequest("Роль не найдена"));
      }
      return res.json({ message: "ok" });
    } catch (error) {
      return this.handleError(res, error, "Произошла непредвиденная ошибка");
    }
  }
}

export default new RolesController();
