import { Request, Response } from "express";
import { Category } from "../models/models.js";
import ApiError from "../error/ApiError.js";

class CategoriesController {
  private handleError(res: Response, error: unknown, defaultMessage: string): Response {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    } else {
      return res.status(500).json({ message: defaultMessage });
    }
  }

  async createCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { title } = req.body;
      const isCategoryExist = await Category.findOne({ where: { title } });

      if (isCategoryExist) {
        return res.json(ApiError.badRequest("Такая категория уже существует"));
      }

      const category = await Category.create({ title });
      return res.json({ id: category.id, title: category.title });
    } catch (error: unknown) {
      return this.handleError(res, error, "Произошла непредвиденная ошибка");
    }
  }

  async getAllCategories(req: Request, res: Response): Promise<Response> {
    try {
      const categories = await Category.findAll();
      const formattedCategories = categories.map((item) => ({ id: item.id, title: item.title }));
      return res.json(formattedCategories);
    } catch (error: unknown) {
      return this.handleError(res, error, "Произошла непредвиденная ошибка");
    }
  }

  async editCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { title } = req.body;
      const category = await Category.findOne({ where: { id } });

      if (category && title) {
        category.set({ title });
        await category.save();
      }

      return res.json({ message: "ok" });
    } catch (error: unknown) {
      return this.handleError(res, error, "Произошла непредвиденная ошибка");
    }
  }

  async deleteCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const category = await Category.findOne({ where: { id } });

      if (!category) {
        return res.json(ApiError.badRequest("Категория не найдена"));
      }

      await category.destroy();
      return res.json({ message: "ok" });
    } catch (error: unknown) {
      return this.handleError(res, error, "Произошла непредвиденная ошибка");
    }
  }
}

export default new CategoriesController();
