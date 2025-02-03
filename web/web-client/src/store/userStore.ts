import { create} from 'zustand';
import { User } from '@/types/user';

interface UserStore {
    user: User;
    setUser: (user: User) => void;
}

const useUserStore = create<UserStore>((set) => ({
    user: {
        name: '',
        account: '',
        avatarUrl: '',
        id: 0,
    },
    setUser: (user: User) => set({ user }),
}));

export default useUserStore;
