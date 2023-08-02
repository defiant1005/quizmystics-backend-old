const Router = require('express');
const router = new Router();
const gameController = require('../controllers/gameController')


router.post('/check-answer', gameController.checkAnswer)

module.exports = router