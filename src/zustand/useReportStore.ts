import { create } from 'zustand';
import { ReportModel } from '../models/ReportModel';

interface ReportState {
    reports: ReportModel[];
    loading: boolean;
    error: string | null;
    setReports: (reports: ReportModel[]) => void;
    addReport: (report: ReportModel) => void;
    editReport: (id: string, report: ReportModel) => void
    removeReport: (id: string) => void;
    clearReports: () => void;
}

const useReportStore = create<ReportState>((set) => ({
    reports: [],
    loading: false,
    error: null,

    setReports: (reports: ReportModel[]) => set({ reports }),
    addReport: (report: ReportModel) =>
        set((state: any) => ({ reports: [...state.reports, report] })),
    editReport: (id: string, report: ReportModel) =>
        set((state: any) => {
            const index = state.reports.findIndex((item: any) => item.id === id)
            state.reports[index] = report
            return ({ reports: [...state.reports] })
        }),
    removeReport: (id: string) =>
        set((state: any) => ({
            reports: state.reports.filter((item: ReportModel) => item.id !== id),
        })),
    clearReports: () => set({ reports: [] }),
}));

export default useReportStore;