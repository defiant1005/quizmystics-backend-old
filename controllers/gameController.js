const {Question, Category} = require("../models/models");

class GameController {
    async checkAnswer(req, res) {
        const {id, answer} = req.body
        const question = await Question.findOne({
            where: {id}
        })
        if (question.correct_answer === answer) {
            return res.json({
                message: 'good'
            })
        }
        return res.json({
            message: 'bad'
        })

    }
}

module.exports = new GameController()