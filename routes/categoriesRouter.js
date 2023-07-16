const Router = require('express');
const router = new Router();
const categoriesController = require('../controllers/categoriesController')
const checkRole = require('../middleware/checkRoleMiddleware')

router.post('/', checkRole(2), categoriesController.createCategory)
router.get('/', categoriesController.getAllCategories)
router.put('/:id', categoriesController.editCategory)
router.delete('/:id', checkRole(2), categoriesController.deleteCategory)

module.exports = router