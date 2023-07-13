const ApiError = require("../error/ApiError");
const {Role} = require("../models/models");

class RolesController {
    async createRole(req, res) {
        const {role} = req.body
        const newRole = await Role.create({role})
        return res.json(newRole)
    }

    async getAllRole(req, res) {
        const roles = await Role.findAll()
        return res.json(roles)
    }

    async getOneRole(req, res) {
        const {id} = req.params
        const role = await Role.findOne({
            where: {id}
        })
        return res.json(role)
    }

    async deleteRole(req, res, next) {
        try {
            const {id} = req.params
            const role = await Role.findOne({
                where: {id}
            })
            await role.destroy();
            return res.json({message: 'ok'})
        } catch (e) {
            return next(ApiError.badRequest('Что-то пошло не так'))
        }

    }
}

module.exports = new RolesController()