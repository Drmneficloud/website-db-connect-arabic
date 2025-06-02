import React, { useState, useEffect } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input'; // Added for profile editing
    import { motion } from 'framer-motion';
    import { User, ListOrdered, Eye, Loader2, Save } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabaseClient';
     import {
      Dialog,
      DialogContent,
      DialogDescription,
      DialogFooter,
      DialogHeader,
      DialogTitle,
    } from "@/components/ui/dialog";

    const ClientDashboardPage = () => {
      const navigate = useNavigate();
      const { toast } = useToast();
      const [activeTab, setActiveTab] = useState("orders");
      const [clientOrders, setClientOrders] = useState([]);
      const [clientProfile, setClientProfile] = useState({ id: null, full_name: '', email: '' });
      const [isLoading, setIsLoading] = useState(true);
      const [isEditingProfile, setIsEditingProfile] = useState(false);
      const [selectedOrder, setSelectedOrder] = useState(null);
      const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

      useEffect(() => {
        const fetchClientData = async () => {
          setIsLoading(true);
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            navigate('/login');
            toast({ variant: "destructive", title: "غير مصرح به", description: "يرجى تسجيل الدخول للوصول لهذه الصفحة." });
            setIsLoading(false);
            return;
          }

          // Fetch client profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, email, role')
            .eq('id', user.id)
            .single();

          if (profileError || !profileData) {
            console.error("Error fetching profile or profile not found:", profileError);
            toast({ variant: "destructive", title: "خطأ", description: "لم يتم العثور على ملفك الشخصي." });
            // Potentially log out user if profile is essential and missing
            await supabase.auth.signOut();
            navigate('/login');
            setIsLoading(false);
            return;
          }
          
          if (profileData.role === 'admin') { // Redirect admin to admin dashboard
            navigate('/admin');
            toast({ title: "إعادة توجيه", description: "تم توجيهك إلى لوحة تحكم المدير."});
            setIsLoading(false);
            return;
          }
          setClientProfile({ id: profileData.id, full_name: profileData.full_name || '', email: profileData.email });


          // Fetch client orders
          const { data: ordersData, error: ordersError } = await supabase
            .from('drmnef_orders')
            .select('*')
            .eq('user_id', user.id)
            .order('order_date', { ascending: false });
          
          if (ordersError) {
            console.error("Error fetching orders:", ordersError);
            toast({ variant: "destructive", title: "خطأ", description: "لم نتمكن من تحميل طلباتك." });
          } else {
            setClientOrders(ordersData || []);
          }
          setIsLoading(false);
        };
        fetchClientData();
      }, [navigate, toast]);

      const viewOrderDetails = (order) => {
        setSelectedOrder(order);
        setIsOrderModalOpen(true);
      };

      const handleProfileChange = (e) => {
        setClientProfile({ ...clientProfile, [e.target.name]: e.target.value });
      };

      const handleSaveProfile = async () => {
        if (!clientProfile.full_name) {
            toast({ variant: "destructive", title: "خطأ", description: "الاسم الكامل مطلوب." });
            return;
        }
        const { error } = await supabase
            .from('profiles')
            .update({ full_name: clientProfile.full_name, updated_at: new Date().toISOString() })
            .eq('id', clientProfile.id);

        if (error) {
            toast({ variant: "destructive", title: "خطأ", description: "لم يتم تحديث الملف الشخصي: " + error.message });
        } else {
            toast({ title: "تم تحديث الملف الشخصي بنجاح!" });
            setIsEditingProfile(false);
        }
      };
      
      const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ أثناء تسجيل الخروج." });
        } else {
          localStorage.removeItem('userRole'); // Clear role from localStorage
          toast({ title: "تم تسجيل الخروج بنجاح" });
          navigate('/login');
        }
      };


      if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
      }

      const renderClientOrdersTable = () => (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                {['رقم الطلب', 'الخدمة', 'تاريخ الطلب', 'الحالة', 'الإجمالي', 'إجراءات'].map(header => (
                  <th key={header} scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800/50 divide-y divide-gray-200 dark:divide-slate-700">
              {clientOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.service_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(order.order_date).toLocaleDateString('ar-SA')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'تم الإكمال' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' :
                        order.status === 'جارٍ التنفيذ' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' :
                        order.status === 'بانتظار الدفع' ? 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                      }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.total_amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button variant="ghost" size="sm" onClick={() => viewOrderDetails(order)}><Eye className="w-4 h-4 ml-1" /> عرض التفاصيل</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           {clientOrders.length === 0 && <p className="text-center py-4 text-gray-500 dark:text-gray-400">لا توجد طلبات لعرضها.</p>}
        </div>
      );

      const renderProfileSettings = () => (
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">ملفي الشخصي</CardTitle>
            <CardDescription>عرض وتعديل معلومات حسابك.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditingProfile ? (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="full_name" className="text-gray-700 dark:text-gray-200">الاسم الكامل</Label>
                        <Input id="full_name" name="full_name" value={clientProfile.full_name} onChange={handleProfileChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email_display" className="text-gray-700 dark:text-gray-200">البريد الإلكتروني</Label>
                        <Input id="email_display" name="email_display" value={clientProfile.email} disabled className="bg-slate-100 dark:bg-slate-700"/>
                    </div>
                    <div className="flex space-x-2 space-x-reverse">
                        <Button onClick={handleSaveProfile}><Save className="ml-2 h-4 w-4"/> حفظ التغييرات</Button>
                        <Button variant="outline" onClick={() => setIsEditingProfile(false)}>إلغاء</Button>
                    </div>
                </>
            ) : (
                <>
                    <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">الاسم</Label>
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{clientProfile.full_name || 'غير متوفر'}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">البريد الإلكتروني</Label>
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{clientProfile.email}</p>
                    </div>
                    <Button className="w-full" variant="outline" onClick={() => setIsEditingProfile(true)}>
                        تعديل الملف الشخصي
                    </Button>
                </>
            )}
            <Button className="w-full" variant="outline" onClick={() => toast({title: "ميزة قيد التطوير", description: "تغيير كلمة المرور سيكون متاحاً قريباً."})}>
              تغيير كلمة المرور (قيد التطوير)
            </Button>
          </CardContent>
        </Card>
      );

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-8 px-4"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold gradient-text">لوحة تحكم العميل</h1>
            <Button variant="outline" onClick={handleSignOut}>تسجيل الخروج</Button>
          </div>
          <p className="text-xl mb-6 text-gray-700 dark:text-gray-300">مرحباً بك، <span className="font-semibold text-primary">{clientProfile.full_name || clientProfile.email}</span>!</p>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="orders" className="flex items-center space-x-1 space-x-reverse"><ListOrdered className="w-5 h-5" /><span>طلباتي</span></TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center space-x-1 space-x-reverse"><User className="w-5 h-5" /><span>ملفي الشخصي</span></TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">سجل طلباتي</CardTitle>
                  <CardDescription>عرض حالة جميع طلباتك السابقة والحالية.</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderClientOrdersTable()}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile">
              {renderProfileSettings()}
            </TabsContent>
          </Tabs>

          <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>تفاصيل الطلب #{selectedOrder?.id}</DialogTitle>
              </DialogHeader>
              {selectedOrder && (
                <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto">
                  <p><strong>الخدمة:</strong> {selectedOrder.service_name}</p>
                  <p><strong>الحالة:</strong> {selectedOrder.status}</p>
                  <p><strong>تاريخ الطلب:</strong> {new Date(selectedOrder.order_date).toLocaleDateString('ar-SA')}</p>
                  <p><strong>الإجمالي:</strong> {selectedOrder.total_amount}</p>
                  {selectedOrder.udid && <p><strong>UDID:</strong> {selectedOrder.udid}</p>}
                  {selectedOrder.notes && <p><strong>ملاحظاتك:</strong> {selectedOrder.notes}</p>}
                  <p><strong>طريقة الدفع:</strong> {selectedOrder.payment_method === 'paypal' ? 'PayPal' : (selectedOrder.payment_method === 'bank_transfer' ? 'تحويل بنكي' : selectedOrder.payment_method )}</p>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOrderModalOpen(false)}>إغلاق</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      );
    };

    export default ClientDashboardPage;