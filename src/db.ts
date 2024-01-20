import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASSWORD!, {
  dialect: "postgres",
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!, 3000),
});
