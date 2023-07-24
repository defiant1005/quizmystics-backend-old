const Router = require('express');
const router = new Router();
const rolesController = require('../controllers/rolesController')
const checkRole = require("../middleware/checkRoleMiddleware");


router.post('/', checkRole(2), rolesController.createRole)
router.get('/', checkRole(2), rolesController.getAllRole)
router.get('/:id', checkRole(2), rolesController.getOneRole)
router.delete('/:id', checkRole(2), rolesController.deleteRole)

module.exports = router