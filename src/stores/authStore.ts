import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  log?: number;
  points?: number;
}

export interface AuthState {
  // Auth state
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (token: string, userData?: Partial<User>) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updatePoints: (points: number) => void;
  setLoading: (loading: boolean) => void;
  
  // Utility methods
  getAuthHeaders: () => Record<string, string>;
  requireAuth: (callback: () => void, actionName?: string) => boolean;
  
  // Token management
  refreshToken: () => Promise<void>;
  validateToken: () => boolean;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Login action
      login: (token: string, userData?: Partial<User>) => {
        set({
          token,
          isAuthenticated: true,
          isLoading: false,
          user: userData ? {
            id: userData.id || '',
            username: userData.username || '',
            email: userData.email,
            phone: userData.phone,
            log: userData.log,
            points: userData.points || 0
          } : null
        });
      },

      // Logout action
      logout: () => {
        // Clear localStorage items
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userLog');
        
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false
        });

      },

      // Update user data
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        
        set({
          user: currentUser ? { ...currentUser, ...userData } : null
        });
      },

      // Update user points
      updatePoints: (points: number) => {
        const currentUser = get().user;
        
        set({
          user: currentUser ? { ...currentUser, points } : null
        });
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Get auth headers for API calls
      getAuthHeaders: () => {
        const { token } = get();
        
        if (!token) {
          return {} as Record<string, string>;
        }

        return {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } as Record<string, string>;
      },

      // Require authentication with automatic redirect
      requireAuth: (callback: () => void, actionName: string = 'access this feature') => {
        const { token, isAuthenticated, isLoading } = get();
        
        if (isLoading) {
          return false;
        }

        if (!token || !isAuthenticated) {
          // Note: Navigation should be handled by the component calling this
          return false;
        }
        callback();
        return true;
      },

      // Token validation
      validateToken: () => {
        const { token } = get();
        
        if (!token) {
          return false;
        }

        // Basic token validation (can be expanded)
        try {
          // Check if token is not empty and has reasonable length
          if (token.length < 10) {
            return false;
          }
          return true;
        } catch (error) {
          return false;
        }
      },

      // Refresh token (placeholder for future implementation)
      refreshToken: async () => {
        console.log('🔄 Auth Store: Token refresh not implemented yet');
        // TODO: Implement token refresh logic
      }
    }),
    {
      name: 'auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      
      // Only persist essential auth data
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),

      // Rehydration callback
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Validate token on rehydration
          if (state.token && !state.validateToken()) {
            state.logout();
          }
        }
      }
    }
  )
);

// Export hook for components
export { useAuthStore };

// Export store actions for external use
export const authActions = {
  login: (token: string, userData?: Partial<User>) => useAuthStore.getState().login(token, userData),
  logout: () => useAuthStore.getState().logout(),
  updateUser: (userData: Partial<User>) => useAuthStore.getState().updateUser(userData),
  updatePoints: (points: number) => useAuthStore.getState().updatePoints(points),
  requireAuth: (callback: () => void, actionName?: string) => 
    useAuthStore.getState().requireAuth(callback, actionName),
  getAuthHeaders: () => useAuthStore.getState().getAuthHeaders(),
  getToken: () => useAuthStore.getState().token,
  isAuthenticated: () => useAuthStore.getState().isAuthenticated
};

// Default export
export default useAuthStore;