const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const JWT = require('jsonwebtoken')
const {User, Category, Question} = require('../models/models')

const generateJwt = (id, email, roleId) => {
    return JWT.sign({
        id,
        email,
        roleId
    }, process.env.SECRET_KEY, {
        expiresIn: '24h'
    })
}

class UserController {
    async registration(req, res, next) {
        const {email, password, roleId} = req.body
        if (!email || !password) {
            return next(ApiError.badRequest('Некорректный email или пароль'))
        }

        const candidate = await User.findOne({where: {email}})
        if (candidate) {
            return next(ApiError.badRequest('Пользователь с таким email уже существует'))
        }

        const hashPassword = await bcrypt.hash(password, 5)
        const user = await User.create({email, roleId, password: hashPassword})
        const token = generateJwt(user.id, user.email, user.roleId)

        return res.json({token})
    }

    async login(req, res, next) {
        const {email, password} = req.body
        const user = await User.findOne({where: {email}})
        if (!user) {
            return next(ApiError.badRequest('Пользователь с таким email не найден'))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            return next(ApiError.badRequest('Неверный логин или пароль'))
        }
        const token = generateJwt(user.id, user.email, user.roleId)
        return res.json({token})
    }

    async check(req, res, next) {
        const token = generateJwt(req.user.id, req.user.email, req.user.roleId)
        return res.json({token})
    }

    async allUsers(req, res) {
        const users = await User.findAll()
        return res.json(users.map(user => {
            return {
                email: user.email,
                id: user.id,
                roleId: user.roleId
            }
        }))
    }

    async deleteUser(req, res, next) {
        try {
            const {id} = req.params
            const user = await User.findOne({
                where: {id}
            })
            if (user) {
                await user.destroy();
            }
            return res.json({message: 'ok'})
        } catch (e) {
            return next(ApiError.internal('Что-то пошло не так'))
        }

    }
}

module.exports = new UserController()