const Router = require('express');
const router = new Router();
const categoriesController = require('../controllers/categoriesController')
const checkRole = require('../middleware/checkRoleMiddleware')

router.post('/', checkRole('admin'), categoriesController.createCategory)
router.get('/', categoriesController.getAllCategories)
router.delete('/', checkRole('admin'), categoriesController.deleteCategory)

module.exports = router