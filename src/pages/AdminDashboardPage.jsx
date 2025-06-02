import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import { motion } from 'framer-motion';
    import { Settings, Users, ShoppingBag, ListOrdered, Loader2 } from 'lucide-react';
    import { useNavigate } from 'react-router-dom';
    import AdminOrdersTab from '@/components/admin/AdminOrdersTab';
    import AdminServicesTab from '@/components/admin/AdminServicesTab';
    import AdminUsersTab from '@/components/admin/AdminUsersTab';
    import AdminSettingsTab from '@/components/admin/AdminSettingsTab';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabaseClient';
    import { useAuth } from '@/contexts/AuthContext.jsx';

    const AdminDashboardPage = () => {
      const navigate = useNavigate();
      const { toast } = useToast();
      const { user, userRole, signOut: authSignOut } = useAuth();
      const [activeTab, setActiveTab] = useState("orders");
      
      const [orders, setOrders] = useState([]);
      const [services, setServices] = useState([]);
      const [usersData, setUsersData] = useState([]); // Renamed to avoid conflict with lucide icon
      const [platformSettings, setPlatformSettings] = useState({
        id: 1,
        logo_url: '',
        contact_email: 'Dr.mnef@gmail.com',
        whatsapp_number: '+966538182861',
        default_language: 'ar',
        bank_transfer_barcode_url: '',
      });
      const [isLoading, setIsLoading] = useState(true);
      const [errorFetching, setErrorFetching] = useState(null);


      useEffect(() => {
        const fetchData = async () => {
          if (!user || userRole !== 'admin') {
            toast({ variant: "destructive", title: "غير مصرح به!", description: "يجب أن تكون مديراً للوصول لهذه الصفحة." });
            authSignOut(); // Sign out if not admin or no user
            navigate('/admin/login');
            setIsLoading(false);
            return;
          }

          setIsLoading(true);
          setErrorFetching(null);
          let fetchErrorOccurred = false;

          // Fetch Orders
          const { data: ordersData, error: ordersError } = await supabase.from('drmnef_orders').select('*').order('order_date', { ascending: false });
          if (ordersError) {
            console.error('Error fetching orders:', ordersError);
            toast({ variant: "destructive", title: "خطأ", description: `فشل تحميل الطلبات: ${ordersError.message}` });
            fetchErrorOccurred = true;
          } else {
            setOrders(ordersData || []);
          }

          // Fetch Services
          const { data: servicesData, error: servicesError } = await supabase.from('drmnef_services').select('*').order('created_at', { ascending: false });
          if (servicesError) {
            console.error('Error fetching services:', servicesError);
            toast({ variant: "destructive", title: "خطأ", description: `فشل تحميل الخدمات: ${servicesError.message}` });
            fetchErrorOccurred = true;
          } else {
            setServices(servicesData || []);
          }
          
          // Fetch Users (Profiles)
          const { data: usersProfilesData, error: usersError } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
          if (usersError) {
            console.error('Error fetching users:', usersError);
            toast({ variant: "destructive", title: "خطأ", description: `فشل تحميل المستخدمين: ${usersError.message}` });
            fetchErrorOccurred = true;
          } else {
            setUsersData(usersProfilesData || []);
          }

          // Fetch Platform Settings
          const { data: settingsData, error: settingsError } = await supabase.from('platform_settings').select('*').eq('id', 1).single();
          if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116: no rows found, which is fine if defaults are used
            console.error('Error fetching platform settings:', settingsError);
            toast({ variant: "destructive", title: "خطأ", description: `فشل تحميل إعدادات المنصة: ${settingsError.message}` });
            fetchErrorOccurred = true;
          } else if (settingsData) {
            setPlatformSettings(settingsData);
          } else {
             // If no settings found, use default and maybe log it.
             console.warn("No platform settings found in DB, using defaults.");
          }
          
          if (fetchErrorOccurred) {
            setErrorFetching("حدث خطأ أثناء تحميل بعض البيانات. يرجى المحاولة مرة أخرى أو الاتصال بالدعم.");
          }
          setIsLoading(false);
        };

        fetchData();
      }, [user, userRole, navigate, toast, authSignOut]);

      const handleSignOut = async () => {
        await authSignOut();
        toast({ title: "تم تسجيل الخروج بنجاح" });
        navigate('/admin/login');
      };


      if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /> <span className="ml-4 text-xl">جاري تحميل لوحة التحكم...</span></div>;
      }

      if (errorFetching) {
        return (
          <div className="flex flex-col justify-center items-center h-screen text-center p-4">
            <h2 className="text-2xl font-semibold text-destructive mb-4">خطأ في تحميل البيانات</h2>
            <p className="text-lg mb-6">{errorFetching}</p>
            <Button onClick={() => window.location.reload()}>إعادة تحميل الصفحة</Button>
          </div>
        );
      }


      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-8 px-4"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold gradient-text">لوحة تحكم المدير</h1>
            <Button variant="outline" onClick={handleSignOut}>تسجيل الخروج</Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
              <TabsTrigger value="orders" className="flex items-center space-x-1 space-x-reverse"><ListOrdered className="w-5 h-5" /><span>إدارة الطلبات</span></TabsTrigger>
              <TabsTrigger value="services" className="flex items-center space-x-1 space-x-reverse"><ShoppingBag className="w-5 h-5" /><span>إدارة الخدمات</span></TabsTrigger>
              <TabsTrigger value="users" className="flex items-center space-x-1 space-x-reverse"><Users className="w-5 h-5" /><span>إدارة المستخدمين</span></TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-1 space-x-reverse"><Settings className="w-5 h-5" /><span>إعدادات المنصة</span></TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
                <AdminOrdersTab orders={orders} setOrders={setOrders} />
            </TabsContent>

            <TabsContent value="services">
                <AdminServicesTab services={services} setServices={setServices} />
            </TabsContent>
            
            <TabsContent value="users">
                <AdminUsersTab users={usersData} setUsers={setUsersData} />
            </TabsContent>

            <TabsContent value="settings">
                <AdminSettingsTab platformSettings={platformSettings} setPlatformSettings={setPlatformSettings} />
            </TabsContent>
          </Tabs>
        </motion.div>
      );
    };
    
    export default AdminDashboardPage;