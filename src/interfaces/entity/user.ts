import { Model } from "sequelize";

interface UserAttributes {
  id: number;
  email: string;
  password: string;
}

interface UserCreationAttributes extends UserAttributes {}

export interface IUserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {}

export type IUser = typeof Model & {
  new (values?: object, options?: object): IUserInstance;
};
