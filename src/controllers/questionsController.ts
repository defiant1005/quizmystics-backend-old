import { Request, Response, NextFunction } from "express";
import ApiError from "../error/ApiError";
import { Question } from "../models/models";

class QuestionsController {
  async createQuestion(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const { title, answer1, answer2, answer3, answer4, correct_answer, categoryId } = req.body;

      if (title && answer1 && answer2 && answer3 && answer4 && correct_answer && categoryId) {
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
      }

      return next(
        ApiError.badRequest(
          "Поля title, answer1, answer2, answer3, answer4, correct_answer, categoryId являются обязательными",
        ),
      );
    } catch (error) {
      return next(ApiError.internal(error.message));
    }
  }

  async getAllQuestion(req: Request, res: Response): Promise<Response> {
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
  }

  async getOneQuestion(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const question = await Question.findOne({
      where: { id },
    });

    if (!question) {
      return next(ApiError.badRequest("Вопрос не найден"));
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

      return next(ApiError.badRequest("ID и answer обязательны"));
    } catch (error) {
      return next(ApiError.internal(error.message));
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

      return next(
        ApiError.badRequest(
          "Поля title, answer1, answer2, answer3, answer4, correct_answer, categoryId являются обязательными",
        ),
      );
    } catch (error) {
      return next(ApiError.internal(error.message));
    }
  }

  async deleteQuestion(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const { id } = req.params;
      const question = await Question.findOne({
        where: { id },
      });

      if (!question) {
        return next(ApiError.badRequest("Вопрос не найден"));
      }

      await question.destroy();
      return res.json({ message: "ok" });
    } catch (error) {
      return next(ApiError.badRequest("Что-то пошло не так"));
    }
  }
}

export default new QuestionsController();
