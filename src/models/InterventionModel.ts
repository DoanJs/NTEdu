import { TimeAtModel } from "./TimeAtModel";

export interface InterventionModel {
    id: string;
    level: number
    name: string

    createAt: TimeAtModel;
    updateAt: TimeAtModel;
}
