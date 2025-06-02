
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import AuthPage from '@/pages/AuthPage';
import ServiceDetailPage from '@/pages/ServiceDetailPage';
import ServiceRequestPageWrapper from '@/pages/ServiceRequestPageWrapper';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import ClientDashboardPage from '@/pages/ClientDashboardPage';
import TrackOrderPage from '@/pages/TrackOrderPage';
import SupportPage from '@/pages/SupportPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import './index.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Router>
          <AuthProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/service/:serviceType" element={<ServiceDetailPage />} />
                <Route path="/request-service/:serviceType" element={<ServiceRequestPageWrapper />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/dashboard" element={<ClientDashboardPage />} />
                <Route path="/track-order" element={<TrackOrderPage />} />
                <Route path="/support" element={<SupportPage />} />
              </Routes>
            </Layout>
            <Toaster />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
