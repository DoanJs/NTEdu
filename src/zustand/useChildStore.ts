import { create } from "zustand";
import { ChildrenModel } from "../models/ChildrenModel";

interface ChildState {
  child: ChildrenModel | null;
  loading: boolean;
  error: string | null;
  setChild: (child: ChildrenModel | null) => void;
  clearClear: () => void;
}

const useChildStore = create<ChildState>((set) => ({
  child: null,
  loading: false,
  error: null,

  setChild: (child: ChildrenModel | null) => set({ child }),
  clearClear: () => set({ child: null }),
}));

export default useChildStore;
