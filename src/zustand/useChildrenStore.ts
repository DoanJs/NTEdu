import { create } from 'zustand';
import { ChildrenModel } from '../models/ChildrenModel';

interface ChildrenState {
    children: ChildrenModel[];
    loading: boolean;
    error: string | null;
    setChildren: (children: ChildrenModel[]) => void;
    addChild: (child: ChildrenModel) => void;
    editChild: (id: string, child: ChildrenModel) => void
    removeChild: (id: string) => void;
    clearChildren: () => void;
}

const useChildrenStore = create<ChildrenState>((set) => ({
    children: [],
    loading: false,
    error: null,

    setChildren: (children: ChildrenModel[]) => set({ children }),
    addChild: (child: ChildrenModel) =>
        set((state: any) => ({ children: [...state.children, child] })),
    editChild: (id: string, child: ChildrenModel) =>
        set((state: any) => {
            const index = state.children.findIndex((item: any) => item.id === id)
            state.children[index] = child
            return ({ children: [...state.children] })
        }),
    removeChild: (id: string) =>
        set((state: any) => ({
            children: state.children.filter((item: ChildrenModel) => item.id !== id),
        })),
    clearChildren: () => set({ children: [] }),
}));

export default useChildrenStore;