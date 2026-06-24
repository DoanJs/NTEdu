import { create } from 'zustand';
import { CommentModel } from '../models';

interface CommentState {
    comments: CommentModel[];
    loading: boolean;
    error: string | null;
    setComments: (comments: CommentModel[]) => void;
    addComment: (comment: CommentModel) => void;
    editComment: (id: string, comment: CommentModel) => void
    removeComment: (id: string) => void;
    clearComments: () => void;
}

const useCommentStore = create<CommentState>((set) => ({
    comments: [],
    loading: false,
    error: null,

    setComments: (comments: CommentModel[]) => set({ comments }),
    addComment: (comment: CommentModel) =>
        set((state: any) => ({ comments: [comment, ...state.comments] })),
    editComment: (id: string, comment: CommentModel) =>
        set((state: any) => {
            const index = state.comments.findIndex((item: any) => item.id === id)
            state.comments[index] = comment
            return ({ comments: [...state.comments] })
        }),
    removeComment: (id: string) =>
        set((state: any) => ({
            comments: state.comments.filter((item: CommentModel) => item.id !== id),
        })),
    clearComments: () => set({ comments: [] }),
}));

export default useCommentStore;