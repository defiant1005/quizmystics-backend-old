const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const checkRole = require('../middleware/checkRoleMiddleware.js');

router.post('/registration', userController.registration);
router.post('/login', userController.login);
router.get('/auth', authMiddleware, userController.check);
router.get('/users', authMiddleware, userController.allUsers);
router.put('/users/:id', authMiddleware, userController.editUser);
router.delete('/users/:id', checkRole(2), userController.deleteUser);

module.exports = router;
