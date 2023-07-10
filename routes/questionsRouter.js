const Router = require('express');
const router = new Router();
const questionsController = require('../controllers/questionsController')


router.post('/', questionsController.createQuestion)
router.get('/', questionsController.getAllQuestion)
router.get('/:id', questionsController.getOneQuestion)
router.delete('/', questionsController.deleteQuestion)

module.exports = router