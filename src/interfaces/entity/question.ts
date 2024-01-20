import { Model } from "sequelize";

interface QuestionAttributes {
  id: number;
  title: string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4?: string | null;
  correct_answer: string;
}

interface QuestionCreationAttributes extends QuestionAttributes {}

export interface IQuestionInstance extends Model<QuestionAttributes, QuestionCreationAttributes>, QuestionAttributes {}

export type IQuestion = typeof Model & {
  new (values?: object, options?: object): IQuestionInstance;
};
