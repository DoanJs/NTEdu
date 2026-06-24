import { create } from 'zustand';
import { PlanTaskModel } from '../models/PlanTaskModel';

interface TotalPlanTaskState {
    totalPlanTasks: PlanTaskModel[];
    loading: boolean;
    error: string | null;
    setTotalPlanTasks: (totalPlanTasks: PlanTaskModel[]) => void;
    addTotalPlanTask: (totalPlanTask: PlanTaskModel) => void;
    editTotalPlanTask: (id: string, totalPlanTask: PlanTaskModel) => void
    removeTotalPlanTask: (id: string) => void;
    clearTotalPlanTasks: () => void;
}

const useTotalPlanTaskStore = create<TotalPlanTaskState>((set) => ({
    totalPlanTasks: [],
    loading: false,
    error: null,

    setTotalPlanTasks: (totalPlanTasks: PlanTaskModel[]) => set({ totalPlanTasks }),
    addTotalPlanTask: (totalPlanTask: PlanTaskModel) =>
        set((state: any) => ({ totalPlanTasks: [...state.totalPlanTasks, totalPlanTask] })),
    editTotalPlanTask: (id: string, totalPlanTask: PlanTaskModel) =>
        set((state: any) => {
            const index = state.totalPlanTasks.findIndex((item: any) => item.id === id)
            state.totalPlanTasks[index] = totalPlanTask
            return ({ totalPlanTasks: [...state.totalPlanTasks] })
        }),
    removeTotalPlanTask: (id: string) =>
        set((state: any) => ({
            totalPlanTasks: state.totalPlanTasks.filter((item: PlanTaskModel) => item.id !== id),
        })),
    clearTotalPlanTasks: () => set({ totalPlanTasks: [] }),
}));

export default useTotalPlanTaskStore;