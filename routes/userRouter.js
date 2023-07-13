const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')
const checkRole = require("../middleware/checkRoleMiddleware");

router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.get('/auth', authMiddleware, userController.check)
router.get('/users', authMiddleware, userController.allUsers)
router.delete('/users/:id', checkRole(2), userController.deleteUser)

module.exports = router