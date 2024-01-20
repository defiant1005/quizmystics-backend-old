import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import { IUser, IUserInstance } from "../interfaces/entity/user.js";
import { ICategory } from "../interfaces/entity/category.js";
import { IQuestion } from "../interfaces/entity/question.js";
import { IRole } from "../interfaces/entity/role.js";

const User = sequelize.define<IUserInstance>("user", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
}) as IUser;

const Category = sequelize.define("category", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, unique: true, allowNull: false },
}) as ICategory;

const Question = sequelize.define("question", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, unique: true, allowNull: false },
  answer1: { type: DataTypes.STRING, allowNull: false },
  answer2: { type: DataTypes.STRING, allowNull: false },
  answer3: { type: DataTypes.STRING, allowNull: false },
  answer4: { type: DataTypes.STRING },
  correct_answer: { type: DataTypes.STRING, allowNull: false },
}) as IQuestion;

const Role = sequelize.define("role", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  role: { type: DataTypes.STRING, unique: true, defaultValue: "user" },
}) as IRole;

Category.hasMany(Question);
Question.belongsTo(Category);

Role.hasMany(User);
User.belongsTo(Role);

export { User, Category, Question, Role };
