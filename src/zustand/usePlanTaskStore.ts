import { create } from 'zustand';
import { PlanTaskModel } from '../models/PlanTaskModel';

interface PlanTaskState {
    planTasks: PlanTaskModel[];
    loading: boolean;
    error: string | null;
    setPlanTasks: (planTasks: PlanTaskModel[]) => void;
    addPlanTask: (planTask: PlanTaskModel) => void;
    editPlanTask: (id: string, planTask: PlanTaskModel) => void
    removePlanTask: (id: string) => void;
    clearPlanTasks: () => void;
}

const usePlanTaskStore = create<PlanTaskState>((set) => ({
    planTasks: [],
    loading: false,
    error: null,

    setPlanTasks: (planTasks: PlanTaskModel[]) => set({ planTasks }),
    addPlanTask: (planTask: PlanTaskModel) =>
        set((state: any) => ({ planTasks: [...state.planTasks, planTask] })),
    editPlanTask: (id: string, planTask: PlanTaskModel) =>
        set((state: any) => {
            const index = state.planTasks.findIndex((item: any) => item.id === id)
            state.planTasks[index] = planTask
            return ({ planTasks: [...state.planTasks] })
        }),
    removePlanTask: (id: string) =>
        set((state: any) => ({
            planTasks: state.planTasks.filter((item: PlanTaskModel) => item.id !== id),
        })),
    clearPlanTasks: () => set({ planTasks: [] }),
}));

export default usePlanTaskStore;