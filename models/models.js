const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING, unique: true, allowNull: false},
    password: {type: DataTypes.STRING, allowNull: false},
})

const Category = sequelize.define('category', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, unique: true, allowNull: false},
})

const Question = sequelize.define('question', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, unique: true, allowNull: false},
    answer1: {type: DataTypes.STRING, allowNull: false},
    answer2: {type: DataTypes.STRING, allowNull: false},
    answer3: {type: DataTypes.STRING, allowNull: false},
    answer4: {type: DataTypes.STRING},
    correct_answer: {type: DataTypes.STRING, allowNull: false},
})

const Role = sequelize.define('role', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    role: {type: DataTypes.STRING, unique: true, defaultValue: 'user'},
})

Category.hasMany(Question)
Question.belongsTo(Category)

Role.hasMany(User)
User.belongsTo(Role)

module.exports = {
    User,
    Category,
    Question,
    Role
}