import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

// This hook manages all user authentication and profile data
// It works with or without Supabase - if no database is configured,
// it creates a mock session that persists in localStorage

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Supabase is not configured, check for mock user session
    if (!supabase) {
      console.log('Supabase not configured, checking for mock session');
      const mockUser = localStorage.getItem('ausguard_mock_user');
      const mockProfile = localStorage.getItem('ausguard_mock_profile');
      
      if (mockUser && mockProfile) {
        try {
          setUser(JSON.parse(mockUser));
          setProfile(JSON.parse(mockProfile));
          console.log('Mock session restored');
        } catch (error) {
          console.error('Error parsing mock session:', error);
          localStorage.removeItem('ausguard_mock_user');
          localStorage.removeItem('ausguard_mock_profile');
        }
      }
      
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      console.log('Supabase not configured, using mock authentication');
      // Create mock user and profile
      const mockUser = {
        id: 'mock-user-id',
        email: email,
        full_name: email.split('@')[0],
        phone: '',
        created_at: new Date().toISOString()
      };
      
      const mockProfile = {
        id: 'mock-profile-id',
        user_id: mockUser.id,
        latitude: -33.8688,
        longitude: 151.2093,
        suburb: 'Sydney',
        state: 'NSW',
        postcode: '2000',
        notification_preferences: {
          severe_weather: true,
          emergency_alerts: true,
          health_reminders: false,
          news_updates: true
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Store in localStorage for persistence
      localStorage.setItem('ausguard_mock_user', JSON.stringify(mockUser));
      localStorage.setItem('ausguard_mock_profile', JSON.stringify(mockProfile));
      
      // Set state
      setUser(mockUser);
      setProfile(mockProfile);
      
      return { error: null };
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    if (!supabase) {
      console.log('Supabase not configured, using mock registration');
      // Create mock user and profile for signup
      const mockUser = {
        id: 'mock-user-id',
        email: email,
        full_name: userData.full_name || email.split('@')[0],
        phone: userData.phone || '',
        created_at: new Date().toISOString()
      };
      
      const mockProfile = {
        id: 'mock-profile-id',
        user_id: mockUser.id,
        latitude: userData.latitude || -33.8688,
        longitude: userData.longitude || 151.2093,
        suburb: userData.suburb || 'Sydney',
        state: userData.state || 'NSW',
        postcode: userData.postcode || '2000',
        notification_preferences: userData.notification_preferences || {
          severe_weather: true,
          emergency_alerts: true,
          health_reminders: false,
          news_updates: true
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Store in localStorage for persistence
      localStorage.setItem('ausguard_mock_user', JSON.stringify(mockUser));
      localStorage.setItem('ausguard_mock_profile', JSON.stringify(mockProfile));
      
      // Set state
      setUser(mockUser);
      setProfile(mockProfile);
      
      return { data: { user: mockUser }, error: null };
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (!error && data.user) {
      // Create profile
      await createProfile(data.user.id, userData);
    }

    return { data, error };
  };

  const signOut = async () => {
    if (!supabase) {
      console.log('Supabase not configured, clearing mock session');
      // Clear mock session from localStorage
      localStorage.removeItem('ausguard_mock_user');
      localStorage.removeItem('ausguard_mock_profile');
      // Clear local state
      setUser(null);
      setProfile(null);
      return { error: null };
    }
    
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const createProfile = async (userId: string, userData: Partial<UserProfile>) => {
    if (!supabase) {
      return { error: new Error('Supabase not configured.') };
    }
    
    const { error } = await supabase
      .from('user_profiles')
      .insert([
        {
          user_id: userId,
          ...userData
        }
      ]);

    if (!error) {
      await fetchProfile(userId);
    }

    return { error };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user logged in') };
    if (!supabase) {
      return { error: new Error('Supabase not configured.') };
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (!error) {
      await fetchProfile(user.id);
    }

    return { error };
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    createProfile
  };
}