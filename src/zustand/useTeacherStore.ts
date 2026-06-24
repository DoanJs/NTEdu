import { create } from 'zustand';
import { UserModel } from '../models/UserModel';

interface TeacherState {
    teachers: UserModel[];
    loading: boolean;
    error: string | null;
    setTeachers: (teachers: UserModel[]) => void;
    addTeacher: (teacher: UserModel) => void;
    editTeacher: (id: string, teacher: UserModel) => void
    removeTeacher: (id: string) => void;
    clearTeachers: () => void;
}

const useTeacherStore = create<TeacherState>((set) => ({
    teachers: [],
    loading: false,
    error: null,

    setTeachers: (teachers: UserModel[]) => set({ teachers }),
    addTeacher: (teacher: UserModel) =>
        set((state: any) => ({ teachers: [...state.teachers, teacher] })),
    editTeacher: (id: string, teacher: UserModel) =>
        set((state: any) => {
            const index = state.teachers.findIndex((item: any) => item.id === id)
            state.teachers[index] = teacher
            return ({ teachers: [...state.teachers] })
        }),
    removeTeacher: (id: string) =>
        set((state: any) => ({
            teachers: state.teachers.filter((item: UserModel) => item.id !== id),
        })),
    clearTeachers: () => set({ teachers: [] }),
}));

export default useTeacherStore;