import { create } from 'zustand';
import { TargetModel } from '../models/TargetModel';

interface TargetState {
    targets: TargetModel[];
    loading: boolean;
    error: string | null;
    setTargets: (targets: TargetModel[]) => void;
    addTarget: (target: TargetModel) => void;
    editTarget: (id: string, target: TargetModel) => void
    removeTarget: (id: string) => void;
    clearTargets: () => void;
}

const useTargetStore = create<TargetState>((set) => ({
    targets: [],
    loading: false,
    error: null,

    setTargets: (targets: TargetModel[]) => set({ targets }),
    addTarget: (target: TargetModel) =>
        set((state: any) => ({ targets: [...state.targets, target] })),
    editTarget: (id: string, target: TargetModel) =>
        set((state: any) => {
            const index = state.targets.findIndex((item: any) => item.id === id)
            state.targets[index] = target
            return ({ targets: [...state.targets] })
        }),
    removeTarget: (id: string) =>
        set((state: any) => ({
            targets: state.targets.filter((item: TargetModel) => item.id !== id),
        })),
    clearTargets: () => set({ targets: [] }),
}));

export default useTargetStore;