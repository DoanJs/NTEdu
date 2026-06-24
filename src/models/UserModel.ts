import { FieldValue } from "firebase/firestore";
import { TimeAtModel } from "./TimeAtModel";

export interface UserModel {
  id: string;//nhớ tự customID khi tạo user mới
  fullName: string;
  shortName: string
  email: string;
  phone: string;
  avatar: string;
  birth: string
  role: string
  position: string

  createAt: TimeAtModel | FieldValue;
  updateAt: TimeAtModel | FieldValue;
}
