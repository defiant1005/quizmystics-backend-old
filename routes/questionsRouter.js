const Router = require('express');
const router = new Router();
const questionsController = require('../controllers/questionsController')
const checkRole = require('../middleware/checkRoleMiddleware')


router.post('/', checkRole('admin'), questionsController.createQuestion)
router.get('/', questionsController.getAllQuestion)
router.get('/:id', questionsController.getOneQuestion)
router.delete('/', checkRole('admin'), questionsController.deleteQuestion)

module.exports = router