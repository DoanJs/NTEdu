import { create } from 'zustand';
import { SuggestModel } from '../models/SuggestModel';

interface SuggestState {
    suggests: SuggestModel[];
    loading: boolean;
    error: string | null;
    setSuggests: (suggests: SuggestModel[]) => void;
    addSuggest: (suggest: SuggestModel) => void;
    editSuggest: (id: string, suggest: SuggestModel) => void
    removeSuggest: (id: string) => void;
    clearSuggests: () => void;
}

const useSuggestStore = create<SuggestState>((set) => ({
    suggests: [],
    loading: false,
    error: null,

    setSuggests: (suggests: SuggestModel[]) => set({ suggests }),
    addSuggest: (suggest: SuggestModel) =>
        set((state: any) => ({ suggests: [...state.suggests, suggest] })),
    editSuggest: (id: string, suggest: SuggestModel) =>
        set((state: any) => {
            const index = state.suggests.findIndex((item: any) => item.id === id)
            state.suggests[index] = suggest
            return ({ suggests: [...state.suggests] })
        }),
    removeSuggest: (id: string) =>
        set((state: any) => ({
            suggests: state.suggests.filter((item: SuggestModel) => item.id !== id),
        })),
    clearSuggests: () => set({ suggests: [] }),
}));

export default useSuggestStore;