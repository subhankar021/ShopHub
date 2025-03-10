import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  full_name: string;
  address?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, full_name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  getSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: false,
      error: null,

      getSession: async () => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }
          
          if (session) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (profileError) {
              throw profileError;
            }
            
            set({ 
              session,
              user: profileData
            });
          }
        } catch (error: any) {
          console.error('Session error:', error);
          set({ error: error.message });
        }
      },

      signIn: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) {
            throw error;
          }
          
          if (data.user) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();
              
            if (profileError) {
              throw profileError;
            }
            
            set({ 
              session: data.session,
              user: profileData,
              error: null
            });
          }
        } catch (error: any) {
          console.error('Sign in error:', error);
          set({ 
            error: 'Invalid email or password. Please try again.',
            user: null,
            session: null
          });
        } finally {
          set({ loading: false });
        }
      },

      signUp: async (email, password, full_name) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name
              }
            }
          });
          
          if (error) {
            throw error;
          }
          
          if (data.user) {
            // Wait for the trigger to create the profile
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();
              
            if (profileError) {
              throw profileError;
            }
            
            set({ 
              session: data.session,
              user: profileData,
              error: null
            });
          }
        } catch (error: any) {
          console.error('Sign up error:', error);
          set({ 
            error: 'Registration failed. Please try again.',
            user: null,
            session: null
          });
        } finally {
          set({ loading: false });
        }
      },

      signOut: async () => {
        set({ loading: true });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            throw error;
          }
          set({ 
            user: null, 
            session: null,
            error: null
          });
        } catch (error: any) {
          console.error('Sign out error:', error);
          set({ error: error.message });
        } finally {
          set({ loading: false });
        }
      },

      updateProfile: async (data) => {
        const { user } = get();
        if (!user) return;
        
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', user.id);
            
          if (error) {
            throw error;
          }
          
          set({ 
            user: { ...user, ...data },
            error: null
          });
        } catch (error: any) {
          console.error('Profile update error:', error);
          set({ error: 'Failed to update profile. Please try again.' });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);