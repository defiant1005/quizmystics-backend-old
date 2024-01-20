import { Request, Response, NextFunction } from "express";
import { check, validationResult } from "express-validator";
import { Question } from "../models/models.js";
import ApiError from "../error/ApiError.js";

class QuestionsController {
  async createQuestion(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      check("title").notEmpty().withMessage("Поле title не должно быть пустым");
      check("answer1").notEmpty().withMessage("Поле answer1 не должно быть пустым");
      check("answer2").notEmpty().withMessage("Поле answer2 не должно быть пустым");
      check("answer3").notEmpty().withMessage("Поле answer3 не должно быть пустым");
      check("answer4").notEmpty().withMessage("Поле answer4 не должно быть пустым");
      check("correct_answer").notEmpty().withMessage("Поле correct_answer не должно быть пустым");
      check("categoryId").notEmpty().withMessage("Поле categoryId не должно быть пустым");

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, answer1, answer2, answer3, answer4, correct_answer, categoryId } = req.body;

      const question = await Question.create({
        title,
        answer1,
        answer2,
        answer3,
        answer4,
        correct_answer,
        categoryId,
      });

      return res.json(question);
    } catch (error: unknown) {
      return this.handleError(res, error, "Произошла непредвиденная ошибка");
    }
  }

  async getAllQuestion(req: Request, res: Response): Promise<Response> {
    try {
      const questions = await Question.findAll();
      return res.json(
        questions.map((item) => ({
          id: item.id,
          title: item.title,
          categoryId: item.categoryId,
          answer1: item.answer1,
          answer2: item.answer2,
          answer3: item.answer3,
          answer4: item.answer4,
          correct_answer: item.correct_answer,
        })),
      );
    } catch (error: unknown) {
      return this.handleError(res, error, "Произошла непредвиденная ошибка");
    }
  }

  async getOneQuestion(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const { id } = req.params;
      const question = await Question.findOne({
        where: { id },
      });

      if (!question) {
        return this.handleError(res, ApiError.badRequest("Вопрос не найден"), "Вопрос не найден");
      }

      return res.json({
        id: question.id,
        title: question.title,
        answer1: question.answer1,
        answer2: question.answer2,
        answer3: question.answer3,
        answer4: question.answer4,
        categoryId: question.categoryId,
      });
    } catch (error: unknown) {
      return this.handleError(res, error, "Произошла непредвиденная ошибка");
    }
  }

  async checkAnswer(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const { id } = req.params;
      const { answer } = req.body;

      if (id && typeof answer === "string") {
        const question = await Question.findOne({
          where: { id },
        });

        if (question && question.correct_answer === answer) {
          return res.json({
            message: "good",
          });
        } else {
          return res.json({
            message: "bad",
          });
        }
      }

      return this.handleError(res, ApiError.badRequest("ID и answer обязательны"), "ID и answer обязательны");
    } catch (error: unknown) {
      return this.handleError(res, error, "Произошла непредвиденная ошибка");
    }
  }

  async editQuestion(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const { id } = req.params;
      const { categoryId, title, answer1, answer2, answer3, answer4, correct_answer } = req.body;
      const question = await Question.findOne({
        where: { id },
      });

      if (question && categoryId && title && answer1 && answer2 && answer3 && answer4 && correct_answer) {
        question.set({
          categoryId: categoryId,
          title: title,
          answer1: answer1,
          answer2: answer2,
          answer3: answer3,
          answer4: answer4,
          correct_answer: correct_answer,
        });

        await question.save();
        return res.json({ message: "ok" });
      }

      return this.handleError(
        res,
        ApiError.badRequest(
          "Поля title, answer1, answer2, answer3, answer4, correct_answer, categoryId являются обязательными",
        ),
        "Необходимы все обязательные поля для редактирования вопроса",
      );
    } catch (error: unknown) {
      return this.handleError(res, error, "Произошла непредвиденная ошибка");
    }
  }

  async deleteQuestion(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const { id } = req.params;
      const question = await Question.findOne({
        where: { id },
      });

      if (!question) {
        return this.handleError(res, ApiError.badRequest("Вопрос не найден"), "Вопрос не найден");
      }

      await question.destroy();
      return res.json({ message: "ok" });
    } catch (error: unknown) {
      return this.handleError(res, error, "Что-то пошло не так");
    }
  }

  private handleError(res: Response, error: unknown, defaultMessage: string): Response {
    if (error instanceof ApiError) {
      return res.status(error.status).json({ message: error.message });
    } else if (error instanceof Error) {
      return res.status(500).json({ message: error.message || defaultMessage });
    } else {
      return res.status(500).json({ message: defaultMessage });
    }
  }
}

export default new QuestionsController();
