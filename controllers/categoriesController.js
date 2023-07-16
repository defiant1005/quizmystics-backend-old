const {Category, User} = require("../models/models");
const ApiError = require("../error/ApiError");

class CategoriesController {
    async createCategory(req, res, next) {
        const {title} = req.body

        const isCategoryExist = await Category.findOne({where: {title}})
        if (isCategoryExist) {
            return next(ApiError.badRequest('Такая категория уже существует'))
        }

        const category = await Category.create({title})
        return res.json({
            id: category.id,
            title: category.title,
        })
    }

    async getAllCategories(req, res) {
        const categories = await Category.findAll()
        return res.json(categories.map(item => {
            return {
                id: item.id,
                title: item.title,
            }
        }))
    }

    async editCategory(req, res, next) {
        try {
            const {id} = req.params
            const {title} = req.body
            const category = await Category.findOne({
                where: {id}
            })
            if (category && title) {
                category.set({
                    title: title,
                });
                await category.save();
            }
            return res.json({message: 'ok'})
        } catch (e) {
            return next(ApiError.internal(e))
        }

    }

    async deleteCategory(req, res, next) {
        try {
            const {id} = req.params
            const category = await Category.findOne({
                where: {id}
            })
            await category.destroy();
            return res.json({message: 'ok'})
        } catch (e) {
            return next(ApiError.badRequest('Что-то пошло не так'))
        }
    }
}


module.exports = new CategoriesController();