import React from 'react';
    import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
    import Layout from '@/components/Layout';
    import HomePage from '@/pages/HomePage';
    import TrackOrderPage from '@/pages/TrackOrderPage';
    import SupportPage from '@/pages/SupportPage';
    // import SubscriptionsPage from '@/pages/SubscriptionsPage'; // Removed as per request
    import ServiceRequestPageWrapper from '@/pages/ServiceRequestPageWrapper';
    import AdminLoginPage from '@/pages/AdminLoginPage';
    import AdminDashboardPage from '@/pages/AdminDashboardPage';
    import ClientDashboardPage from '@/pages/ClientDashboardPage';
    import LoginPage from '@/pages/LoginPage';
    import RegisterPage from '@/pages/RegisterPage';
    import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
    import { Toaster } from '@/components/ui/toaster';
    import { ThemeProvider } from '@/components/ThemeProvider';
    import { AuthProvider, useAuth } from '@/contexts/AuthContext.jsx'; // Corrected import path
    import ServiceDetailPage from '@/pages/ServiceDetailPage';


    const ProtectedRoute = ({ children, adminOnly = false }) => {
      const { user, userRole, loading } = useAuth();
    
      if (loading) {
        return <div className="flex justify-center items-center h-screen">جاري التحميل...</div>;
      }
    
      if (!user) {
        return <Navigate to="/login" replace />;
      }
    
      if (adminOnly && userRole !== 'admin') {
        return <Navigate to="/dashboard" replace />; 
      }
    
      return children;
    };
    
    const AdminRoute = ({ children }) => {
      const { user, userRole, loading } = useAuth();

      if (loading) {
        return <div className="flex justify-center items-center h-screen">جاري تحميل صفحة المدير...</div>;
      }
      if(!user) {
         return <Navigate to="/admin/login" replace />;
      }
      if (userRole !== 'admin') {
         return <Navigate to="/" replace />;
      }
      return children;
    }


    function AppRoutes() {
      return (
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/service/:serviceSlug" element={<ServiceDetailPage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="/support" element={<SupportPage />} />
            {/* <Route path="/subscriptions" element={<SubscriptionsPage />} /> */}
            <Route path="/request-service/:serviceType" element={<ServiceRequestPageWrapper />} />
            
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <ClientDashboardPage />
                </ProtectedRoute>
              } 
            />
            {/* Fallback for any other admin routes */}
            <Route 
              path="/admin/*" 
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              } 
            />
          </Routes>
        </Layout>
      );
    }
    
    function App() {
      return (
        <ThemeProvider defaultTheme="light" storageKey="drmnef-ui-theme">
          <Router>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
            <Toaster />
          </Router>
        </ThemeProvider>
      );
    }

    export default App;