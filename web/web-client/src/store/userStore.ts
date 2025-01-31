import { create} from 'zustand';

interface User {
    name: string;
    avatar: string;
}

interface UserStore {
    user: User;
    setUser: (user: User) => void;
}

const useUserStore = create<UserStore>((set) => ({
    user: {
        name: '',
        avatar: 'https://mui.com/static/images/avatar/1.jpg',
    },
    setUser: (user: User) => set({ user }),
}));

export default useUserStore;
