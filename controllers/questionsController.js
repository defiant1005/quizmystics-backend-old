const ApiError = require("../error/ApiError");
const {Question, Category} = require("../models/models");

class QuestionsController {
    async createQuestion(req, res, next) {
        const {title, answer1, answer2, answer3, answer4, correct_answer, categoryId} = req.body
        if (title && answer1 && answer2 && answer3 && answer4 && correct_answer && categoryId) {
            const question = await Question.create({title, answer1, answer2, answer3, answer4, correct_answer, categoryId})
            return res.json(question)
        }
        return next(ApiError.badRequest('Поля title, answer1, answer2, answer3, answer4, correct_answer, categoryId являются обязательными'))
    }

    async getAllQuestion(req, res) {
        const questions = await Question.findAll()
        return res.json(questions.map(item => {
            return {
                id: item.id,
                title: item.title,
                categoryId: item.categoryId,
                answer1: item.answer1,
                answer2: item.answer2,
                answer3: item.answer3,
                answer4: item.answer4,
                correct_answer: item.correct_answer,
            }
        }))
    }

    async getOneQuestion(req, res) {
        const {id} = req.params
        const question = await Question.findOne({
            where: {id}
        })
        return res.json({
            id: question.id,
            title: question.title,
            answer1: question.answer1,
            answer2: question.answer2,
            answer3: question.answer3,
            answer4: question.answer4,
            categoryId: question.categoryId,
        })
    }

    async editQuestion(req, res, next) {
        try {
            const {id} = req.params
            const {
                categoryId,
                title,
                answer1,
                answer2,
                answer3,
                answer4,
                correct_answer
            } = req.body
            const question = await Question.findOne({
                where: {id}
            })
            if (categoryId && title && answer1 && answer2 && answer3 && answer4 && correct_answer) {
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
                return res.json({message: 'ok'})
            }
            return next(ApiError.badRequest('Поля title, answer1, answer2, answer3, answer4, correct_answer, categoryId являются обязательными'))
        } catch (e) {
            return next(ApiError.internal(e))
        }

    }

    async deleteQuestion(req, res, next) {
        try {
            const {id} = req.params
            const question = await Question.findOne({
                where: {id}
            })
            await question.destroy();
            return res.json({message: 'ok'})
        } catch (e) {
            return next(ApiError.badRequest('Что-то пошло не так'))
        }

    }
}

module.exports = new QuestionsController()