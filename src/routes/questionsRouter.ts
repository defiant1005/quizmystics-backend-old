const Router = require('express');
const router = new Router();
const questionsController = require('../controllers/questionsController.js');
const checkRole = require('../middleware/checkRoleMiddleware.js');

router.post('/', checkRole(2), questionsController.createQuestion);
router.post('/check-answer/:id', questionsController.checkAnswer);
router.get('/', questionsController.getAllQuestion);
router.get('/:id', questionsController.getOneQuestion);
router.put('/:id', questionsController.editQuestion);
router.delete('/:id', checkRole(2), questionsController.deleteQuestion);

module.exports = router;
