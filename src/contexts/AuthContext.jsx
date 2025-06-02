
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // إعداد مستمع تغييرات المصادقة أولاً
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // تأخير استدعاء وظائف Supabase لتجنب التداخل
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
          localStorage.removeItem('userRole');
        }
        setLoading(false);
      }
    );

    // ثم فحص الجلسة الحالية
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
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
        setUserRole('client'); // افتراضي للعميل
        localStorage.setItem('userRole', 'client');
        return;
      }
      
      if (profile) {
        setUserRole(profile.role);
        localStorage.setItem('userRole', profile.role);
      } else {
        setUserRole('client');
        localStorage.setItem('userRole', 'client');
      }
    } catch (e) {
      console.error('Exception fetching user role:', e);
      setUserRole('client');
      localStorage.setItem('userRole', 'client');
    }
  };
  
  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
    setUser(null);
    setSession(null);
    setUserRole(null);
    localStorage.removeItem('userRole');
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      userRole, 
      loading, 
      setUser, 
      setUserRole, 
      signOut, 
      fetchUserRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
