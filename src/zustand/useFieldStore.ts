import { create } from 'zustand';
import { FieldModel } from '../models/FieldModel';

interface FieldState {
    fields: FieldModel[];
    loading: boolean;
    error: string | null;
    setFields: (fields: FieldModel[]) => void;
    addField: (field: FieldModel) => void;
    editField: (id: string, field: FieldModel) => void
    removeField: (id: string) => void;
    clearFields: () => void;
}

const useFieldStore = create<FieldState>((set) => ({
    fields: [],
    loading: false,
    error: null,

    setFields: (fields: FieldModel[]) => set({ fields }),
    addField: (field: FieldModel) =>
        set((state: any) => ({ fields: [...state.fields, field] })),
    editField: (id: string, field: FieldModel) =>
        set((state: any) => {
            const index = state.fields.findIndex((item: any) => item.id === id)
            state.fields[index] = field
            return ({ fields: [...state.fields] })
        }),
    removeField: (id: string) =>
        set((state: any) => ({
            fields: state.fields.filter((item: FieldModel) => item.id !== id),
        })),
    clearFields: () => set({ fields: [] }),
}));

export default useFieldStore;