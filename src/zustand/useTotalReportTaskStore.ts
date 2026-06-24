import { create } from 'zustand';
import { ReportTaskModel } from '../models/ReportTaskModel';

interface TotalReportTaskState {
    totalReportTasks: ReportTaskModel[];
    loading: boolean;
    error: string | null;
    setTotalReportTasks: (totalReportTasks: ReportTaskModel[]) => void;
    addTotalReportTask: (totalReportTask: ReportTaskModel) => void;
    editTotalReportTask: (id: string, totalReportTask: ReportTaskModel) => void
    removeTotalReportTask: (id: string) => void;
    clearTotalReportTasks: () => void;
}

const useTotalReportTaskStore = create<TotalReportTaskState>((set) => ({
    totalReportTasks: [],
    loading: false,
    error: null,

    setTotalReportTasks: (totalReportTasks: ReportTaskModel[]) => set({ totalReportTasks }),
    addTotalReportTask: (totalReportTask: ReportTaskModel) =>
        set((state: any) => ({ totalReportTasks: [...state.totalReportTasks, totalReportTask] })),
    editTotalReportTask: (id: string, totalReportTask: ReportTaskModel) =>
        set((state: any) => {
            const index = state.totalReportTasks.findIndex((item: any) => item.id === id)
            state.totalReportTasks[index] = totalReportTask
            return ({ totalReportTasks: [...state.totalReportTasks] })
        }),
    removeTotalReportTask: (id: string) =>
        set((state: any) => ({
            totalReportTasks: state.totalReportTasks.filter((item: ReportTaskModel) => item.id !== id),
        })),
    clearTotalReportTasks: () => set({ totalReportTasks: [] }),
}));

export default useTotalReportTaskStore;