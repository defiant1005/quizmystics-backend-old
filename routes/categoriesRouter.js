const Router = require('express');
const router = new Router();
const categoriesController = require('../controllers/categoriesController')

router.post('/', categoriesController.createCategory)
router.get('/', categoriesController.getAllCategories)
router.delete('/', categoriesController.deleteCategory)

module.exports = router