const Router = require('express');
const router = new Router();
const rolesController = require('../controllers/rolesController')


router.post('/', rolesController.createRole)
router.get('/', rolesController.getAllRole)
router.get('/:id', rolesController.getOneRole)
router.delete('/:id', rolesController.deleteRole)

module.exports = router