import { FieldValue } from "firebase/firestore";
import { TimeAtModel } from "./TimeAtModel";

export interface CartModel {
  id: string;
  fieldId: string;
  level: number;
  name: string;
  targetId: string
  
  content: string;
  intervention: string;
  childId: string;
  teacherIds: string[]
  author: string

  createAt: TimeAtModel | FieldValue;
  updateAt: TimeAtModel | FieldValue;
}
