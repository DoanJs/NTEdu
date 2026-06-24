import { create } from 'zustand';
import { InterventionModel } from '../models/InterventionModel';

interface InterventionState {
    interventions: InterventionModel[];
    loading: boolean;
    error: string | null;
    setInterventions: (interventions: InterventionModel[]) => void;
    addIntervention: (target: InterventionModel) => void;
    editIntervention: (id: string, target: InterventionModel) => void
    removeIntervention: (id: string) => void;
    clearInterventions: () => void;
}

const useInterventionStore = create<InterventionState>((set) => ({
    interventions: [],
    loading: false,
    error: null,

    setInterventions: (interventions: InterventionModel[]) => set({ interventions }),
    addIntervention: (target: InterventionModel) =>
        set((state: any) => ({ interventions: [...state.interventions, target] })),
    editIntervention: (id: string, target: InterventionModel) =>
        set((state: any) => {
            const index = state.interventions.findIndex((item: any) => item.id === id)
            state.interventions[index] = target
            return ({ interventions: [...state.interventions] })
        }),
    removeIntervention: (id: string) =>
        set((state: any) => ({
            interventions: state.interventions.filter((item: InterventionModel) => item.id !== id),
        })),
    clearInterventions: () => set({ interventions: [] }),
}));

export default useInterventionStore;