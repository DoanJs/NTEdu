import { TimeAtModel } from "./TimeAtModel";

export interface FieldModel {
  id: string;
  name: string

  createAt: TimeAtModel;
  updateAt: TimeAtModel;
}
