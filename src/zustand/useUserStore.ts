import { create } from "zustand";
import { UserModel } from "../models/UserModel";

interface UserState {
  user: UserModel | null;
  loading: boolean;
  error: string | null;
  setUser: (
    user:
      | UserModel
      | null
      | ((prev: UserModel | null) => UserModel | null)
  ) => void;
  clearUser: () => void;
}

const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: false,
  error: null,

  setUser: (user) =>
    set((state) => ({
      user: typeof user === "function" ? user(state.user) : user,
    })),
  clearUser: () => set({ user: null }),
}));

export default useUserStore;
