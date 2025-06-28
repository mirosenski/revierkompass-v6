export interface User {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role: 'admin' | 'user';
    avatar?: string;
    isAdmin: boolean;
    lastLogin: Date;
}
export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    login: (user: User) => void;
    loginWithCredentials: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
    hasRole: (role: string) => boolean;
    isAdmin: boolean;
    isLoggingIn: boolean;
    setLoggingIn: (loading: boolean) => void;
}
export declare const useAuthStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<AuthState>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<AuthState, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: AuthState) => void) => () => void;
        onFinishHydration: (fn: (state: AuthState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<AuthState, unknown>>;
    };
}>;
