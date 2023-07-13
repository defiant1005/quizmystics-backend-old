const Router = require('express');
const categoriesRouter = require('./categoriesRouter');
const questionsRouter = require('./questionsRouter');
const userRouter = require('./userRouter');
const rolesRouter = require('./rolesRouter');

const router = new Router();

router.use('/user', userRouter)
router.use('/category', categoriesRouter)
router.use('/question', questionsRouter)
router.use('/roles', rolesRouter)

module.exports = router