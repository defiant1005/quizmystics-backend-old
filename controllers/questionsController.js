const { Question, Category} = require("../models/models");

class QuestionsController {
    async createQuestion(req, res) {
        const {title, answer1, answer2, answer3, answer4, correct_answer, categoryId} = req.body
        const question = await Question.create({title, answer1, answer2, answer3, answer4, correct_answer, categoryId})
        return res.json(question)
    }

    async getAllQuestion(req, res) {
        const questions = await Question.findAll()
        return res.json(questions)
    }

    async getOneQuestion(req, res) {
        const {id} = req.params
        const question = await Question.findOne({
            where: {id}
        })
        return res.json(question)
    }

    async deleteQuestion(req, res) {

    }
}

module.exports = new QuestionsController()