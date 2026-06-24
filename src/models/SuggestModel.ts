import { TimeAtModel } from "./TimeAtModel";

export interface SuggestModel {
  id: string;
  fieldId: string;
  name: string;

  createAt: TimeAtModel;
  updateAt: TimeAtModel;
}
