const {Category} = require("../models/models");

class CategoriesController {
    async createCategory(req, res) {
        const {title} = req.body
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

    async deleteCategory(req, res) {

    }
}

module.exports = new CategoriesController()