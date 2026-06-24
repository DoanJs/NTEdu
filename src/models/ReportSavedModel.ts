import { FieldValue } from "firebase/firestore";
import { TimeAtModel } from "./TimeAtModel";

export interface ReportSavedModel {
  id: string;
  authorId: string
  childId: string;
  content: string;
  intervention: string;
  total: string

  planId: string;
  targetId: string;
  teacherIds: string[]
  
  createAt: TimeAtModel | FieldValue;
  updateAt: TimeAtModel | FieldValue;
}
