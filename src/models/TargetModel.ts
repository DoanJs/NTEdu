import { FieldValue } from "firebase/firestore";
import { TimeAtModel } from "./TimeAtModel";

export interface TargetModel {
  id: string;
  fieldId: string;
  name: string;
  level: number;
  content?: string;

  createAt: TimeAtModel | FieldValue | number;
  updateAt: TimeAtModel | FieldValue | number;
}
