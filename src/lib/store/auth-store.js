import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// Demo users for testing
const DEMO_USERS = {
    'admin': {
        password: 'admin123',
        user: {
            id: 'user_admin_001',
            username: 'admin',
            firstName: 'Max',
            lastName: 'Mustermann',
            email: 'admin@polizei-bw.de',
            role: 'admin',
            avatar: '/favicon.ico',
            isAdmin: true,
            lastLogin: new Date()
        }
    },
    'demo': {
        password: 'demo123',
        user: {
            id: 'user_demo_001',
            username: 'demo',
            firstName: 'Demo',
            lastName: 'Benutzer',
            email: 'demo@polizei-bw.de',
            role: 'user',
            isAdmin: false,
            lastLogin: new Date()
        }
    }
};
export const useAuthStore = create()(persist((set, get) => ({
    // Initial State
    isAuthenticated: false,
    user: null,
    token: null,
    isLoggingIn: false,
    // Actions
    login: (user) => {
        const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        set({
            isAuthenticated: true,
            user: {
                ...user,
                lastLogin: new Date()
            },
            token: token
        });
    },
    loginWithCredentials: async (username, password) => {
        set({ isLoggingIn: true });
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            const userRecord = DEMO_USERS[username.toLowerCase()];
            if (!userRecord || userRecord.password !== password) {
                set({ isLoggingIn: false });
                return false;
            }
            // Generate a simple token
            const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            set({
                isAuthenticated: true,
                user: {
                    ...userRecord.user,
                    lastLogin: new Date()
                },
                token: token,
                isLoggingIn: false
            });
            return true;
        }
        catch (error) {
            console.error('Login error:', error);
            set({ isLoggingIn: false });
            return false;
        }
    },
    logout: () => {
        set({
            isAuthenticated: false,
            user: null,
            token: null
        });
    },
    updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
            set({
                user: { ...currentUser, ...updates }
            });
        }
    },
    // Utilities
    hasRole: (role) => {
        const user = get().user;
        return user ? user.role === role : false;
    },
    get isAdmin() {
        return get().user?.isAdmin || false;
    },
    // Loading States
    setLoggingIn: (loading) => set({ isLoggingIn: loading })
}), {
    name: 'revierkompass-v2-auth',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token
    }),
}));
