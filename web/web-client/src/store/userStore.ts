import { create} from 'zustand';

export interface User {
    name: string;
    avatar: string;
    id: number;
}

interface UserStore {
    user: User;
    setUser: (user: User) => void;
}

const useUserStore = create<UserStore>((set) => ({
    user: {
        name: '',
        avatar: '',
        id: 1,
    },
    setUser: (user: User) => set({ user }),
}));

export default useUserStore;
