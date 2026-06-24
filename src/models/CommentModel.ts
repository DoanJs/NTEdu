import { FieldValue } from "firebase/firestore";
import { TimeAtModel } from "./TimeAtModel";

export interface CommentModel {
  id: string;
  type: string
  childId: string
  authorId: string
  content: string
  _id: string
  teacherIds: string[]
  
  createAt: TimeAtModel | FieldValue | number;
  updateAt: TimeAtModel | FieldValue | number;
}
