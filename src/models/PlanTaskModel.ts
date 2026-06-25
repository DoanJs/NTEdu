import { FieldValue } from "firebase/firestore";
import { TimeAtModel } from "./TimeAtModel";

export interface PlanTaskModel {
  id: string;
  content: string;
  intervention: string;
  targetId: string;
  planId: string;
  childId: string;
  teacherIds: string[]
  authorId: string

  createAt: TimeAtModel | FieldValue;
  updateAt: TimeAtModel | FieldValue;
}
