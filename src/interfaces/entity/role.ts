import { Model } from "sequelize";

interface RoleAttributes {
  id: number;
  role: string;
}

interface RoleCreationAttributes extends RoleAttributes {}

export interface IRoleInstance extends Model<RoleAttributes, RoleCreationAttributes>, RoleAttributes {}

export type IRole = typeof Model & {
  new (values?: object, options?: object): IRoleInstance;
};
