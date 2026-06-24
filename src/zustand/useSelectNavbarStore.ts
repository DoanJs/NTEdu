import { create } from 'zustand';

interface SelectNavbarState {
    selectNavbar: string;
    loading: boolean;
    error: string | null;
    setSelectNavbar: (selectNavbar: string) => void;
    clearSelectNavbar: () => void;
}

const useSelectNavbarStore = create<SelectNavbarState>((set) => ({
    selectNavbar: '',
    loading: false,
    error: null,

    setSelectNavbar: (selectNavbar: string) => set({ selectNavbar }),
    clearSelectNavbar: () => set({ selectNavbar: '' }),
}));

export default useSelectNavbarStore;