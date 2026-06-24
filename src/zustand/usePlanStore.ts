import { create } from 'zustand';
import { PlanModel } from '../models/PlanModel';

interface PlanState {
    plans: PlanModel[];
    loading: boolean;
    error: string | null;
    setPlans: (plans: PlanModel[]) => void;
    addPlan: (plan: PlanModel) => void;
    editPlan: (id: string, plan: PlanModel) => void
    removePlan: (id: string) => void;
    clearPlans: () => void;
}

const usePlanStore = create<PlanState>((set) => ({
    plans: [],
    loading: false,
    error: null,

    setPlans: (plans: PlanModel[]) => set({ plans }),
    addPlan: (plan: PlanModel) =>
        set((state: any) => ({ plans: [...state.plans, plan] })),
    editPlan: (id: string, plan: PlanModel) =>
        set((state: any) => {
            const index = state.plans.findIndex((item: any) => item.id === id)
            state.plans[index] = plan
            return ({ plans: [...state.plans] })
        }),
    removePlan: (id: string) =>
        set((state: any) => ({
            plans: state.plans.filter((item: PlanModel) => item.id !== id),
        })),
    clearPlans: () => set({ plans: [] }),
}));

export default usePlanStore;