const {Category} = require("../models/models");

class CategoriesController {
    async createCategory(req, res) {
        const {title} = req.body
        const category = await Category.create({title})
        return res.json(category)
    }

    async getAllCategories(req, res) {
        const categories = await Category.findAll()
        return res.json(categories)
    }

    async deleteCategory(req, res) {

    }
}

module.exports = new CategoriesController()