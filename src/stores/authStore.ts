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
        console.log('🔐 Auth Store: Logging in with token:', token.substring(0, 20) + '...');
        
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

        console.log('✅ Auth Store: Login successful');
      },

      // Logout action
      logout: () => {
        console.log('🔒 Auth Store: Logging out');
        
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

        console.log('✅ Auth Store: Logout successful');
      },

      // Update user data
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        
        set({
          user: currentUser ? { ...currentUser, ...userData } : null
        });

        console.log('👤 Auth Store: User data updated:', userData);
      },

      // Update user points
      updatePoints: (points: number) => {
        const currentUser = get().user;
        
        set({
          user: currentUser ? { ...currentUser, points } : null
        });

        console.log('💰 Auth Store: Points updated to:', points);
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Get auth headers for API calls
      getAuthHeaders: () => {
        const { token } = get();
        
        if (!token) {
          console.warn('⚠️ Auth Store: No token available for headers');
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
          console.log(`⏳ Auth Store: Token still loading for ${actionName}`);
          return false;
        }

        if (!token || !isAuthenticated) {
          console.log(`🔒 Auth Store: Authentication required to ${actionName}`);
          // Note: Navigation should be handled by the component calling this
          return false;
        }

        console.log(`✅ Auth Store: Authentication verified for ${actionName}`);
        callback();
        return true;
      },

      // Token validation
      validateToken: () => {
        const { token } = get();
        
        if (!token) {
          console.log('❌ Auth Store: No token to validate');
          return false;
        }

        // Basic token validation (can be expanded)
        try {
          // Check if token is not empty and has reasonable length
          if (token.length < 10) {
            console.log('❌ Auth Store: Token too short');
            return false;
          }

          console.log('✅ Auth Store: Token validation passed');
          return true;
        } catch (error) {
          console.error('❌ Auth Store: Token validation error:', error);
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
          console.log('🔄 Auth Store: Rehydrated from localStorage');
          console.log('🔍 Auth Store: Current state:', {
            hasToken: !!state.token,
            isAuthenticated: state.isAuthenticated,
            userId: state.user?.id
          });
          
          // Validate token on rehydration
          if (state.token && !state.validateToken()) {
            console.log('❌ Auth Store: Invalid token on rehydration, logging out');
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