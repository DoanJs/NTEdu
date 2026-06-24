import { TimeAtModel } from "./TimeAtModel";

export interface ReportTaskModel {
  id: string;
  content: string;
  isEdit: boolean
  planId: string
  planTaskId: string;
  reportId: string
  childId: string
  teacherIds: string[]
  authorId: string
  intervention: string[]

  createAt: TimeAtModel;
  updateAt: TimeAtModel;
}
