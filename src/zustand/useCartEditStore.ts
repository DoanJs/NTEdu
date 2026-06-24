import { create } from "zustand";

interface CartEditState {
  cartEdit: any;
  loading: boolean;
  error: string | null;
  setCartEdit: (cartEdit: any) => void;
  clearCartEdit: () => void;
}

const useCartEditStore = create<CartEditState>((set) => ({
  cartEdit: null,
  loading: false,
  error: null,

  setCartEdit: (cartEdit: any) => set({ cartEdit }),
  clearCartEdit: () => set({ cartEdit: null }),
}));

export default useCartEditStore;
