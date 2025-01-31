import { create } from 'zustand'
import { Comment } from '@/types/comment'

interface CommentState {
  comments: Comment[]
  setComments: (comments: Comment[]) => void
  addComment: (comment: Comment) => void
  removeComment: (id: number) => void
  clearComments: () => void
}

export const useCommentStore = create<CommentState>((set) => ({
  comments: [],
  setComments: (comments) => set({ comments }),
  addComment: (comment) => 
    set((state) => ({ 
      comments: [...state.comments, comment] 
    })),
  removeComment: (id: number) =>
    set((state) => ({
      comments: state.comments.filter((comment) => comment.id !== id)
    })),
  clearComments: () => set({ comments: [] }),
})) 
