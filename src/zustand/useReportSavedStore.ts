import { create } from 'zustand';


interface ReportSavedState {
    reportSaveds: any[];
    loading: boolean;
    error: string | null;
    setReportSaveds: (reportSaveds: any[]) => void;
    addReportSaved: (reportSaved: any) => void;
    editReportSaved: (id: string, reportSaved: any) => void
    removeReportSaved: (id: string) => void;
    clearReportSaveds: () => void;
}

const useReportSavedStore = create<ReportSavedState>((set) => ({
    reportSaveds: [],
    loading: false,
    error: null,

    setReportSaveds: (reportSaveds: any[]) => set({ reportSaveds }),
    addReportSaved: (reportSaved: any) =>
        set((state: any) => ({ reportSaveds: [...state.reportSaveds, reportSaved] })),
    editReportSaved: (id: string, reportSaved: any) =>
        set((state: any) => {
            const index = state.reportSaveds.findIndex((item: any) => item.id === id)
            state.reportSaveds[index] = reportSaved
            return ({ reportSaveds: [...state.reportSaveds] })
        }),
    removeReportSaved: (id: string) =>
        set((state: any) => ({
            reportSaveds: state.reportSaveds.filter((item: any) => item.id !== id),
        })),
    clearReportSaveds: () => set({ reportSaveds: [] }),
}));

export default useReportSavedStore;