import { Model } from "sequelize";

interface CategoryAttributes {
  id?: number;
  title: string;
}

interface CategoryCreationAttributes extends CategoryAttributes {}

export interface ICategoryInstance extends Model<CategoryAttributes, CategoryCreationAttributes>, CategoryAttributes {}

export type ICategory = typeof Model & {
  new (values?: object, options?: object): ICategoryInstance;
};
