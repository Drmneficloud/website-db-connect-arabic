import React, { createContext, useState, useEffect, useContext } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { useNavigate } from 'react-router-dom';

    const AuthContext = createContext();

    export const AuthProvider = ({ children }) => {
      const [user, setUser] = useState(null);
      const [userRole, setUserRole] = useState(null);
      const [loading, setLoading] = useState(true);
      const navigate = useNavigate();

      useEffect(() => {
        const getSession = async () => {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error("Error getting session:", error);
            setLoading(false);
            return;
          }
          
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchUserRole(session.user.id);
          }
          setLoading(false);
        };

        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchUserRole(session.user.id);
          } else {
            setUserRole(null);
            localStorage.removeItem('userRole');
          }
          setLoading(false);
        });

        return () => {
          authListener?.subscription?.unsubscribe();
        };
      }, []);

      const fetchUserRole = async (userId) => {
        if (!userId) {
          setUserRole(null);
          localStorage.removeItem('userRole');
          return;
        }
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

          if (error) {
            console.error('Error fetching user role:', error.message);
            setUserRole(null);
            localStorage.removeItem('userRole');
            return;
          }
          
          if (profile) {
            setUserRole(profile.role);
            localStorage.setItem('userRole', profile.role);
          } else {
            setUserRole(null); // Or 'client' as a default if profile creation failed
            localStorage.removeItem('userRole');
          }
        } catch (e) {
          console.error('Exception fetching user role:', e);
          setUserRole(null);
          localStorage.removeItem('userRole');
        }
      };
      
      const signOut = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Error signing out:", error);
        }
        setUser(null);
        setUserRole(null);
        localStorage.removeItem('userRole');
        setLoading(false);
        // navigate('/login'); // Optional: redirect on sign out
      };


      return (
        <AuthContext.Provider value={{ user, userRole, loading, setUser, setUserRole, signOut, fetchUserRole }}>
          {children}
        </AuthContext.Provider>
      );
    };

    export const useAuth = () => {
      return useContext(AuthContext);
    };