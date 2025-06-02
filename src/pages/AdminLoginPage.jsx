import React, { useState } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { motion } from 'framer-motion';
    import { ShieldCheck, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabaseClient';
    import { useAuth } from '@/contexts/AuthContext';

    const AdminLoginPage = () => {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState('');
      const navigate = useNavigate();
      const { toast } = useToast();
      const { fetchUserRole } = useAuth(); 

      const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) {
          setError(loginError.message === "Invalid login credentials" ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' : loginError.message);
          toast({ variant: "destructive", title: "خطأ في تسجيل الدخول", description: loginError.message === "Invalid login credentials" ? 'البيانات المدخلة غير صحيحة.' : loginError.message });
          setIsLoading(false);
          return;
        }

        if (loginData.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', loginData.user.id)
            .single();

          if (profileError || !profile) {
            setError('حدث خطأ أثناء جلب معلومات المستخدم أو الملف الشخصي غير موجود.');
            toast({ variant: "destructive", title: "خطأ", description: "لا يمكن جلب دور المستخدم أو الملف غير موجود." });
            await supabase.auth.signOut(); 
            setIsLoading(false);
            return;
          }
          
          if (profile.role !== 'admin') {
            setError('الوصول مرفوض. هذه الصفحة مخصصة للمدراء فقط.');
            toast({ variant: "destructive", title: "غير مصرح به", description: "يجب أن تكون مديراً للوصول." });
            await supabase.auth.signOut(); 
            setIsLoading(false);
            return;
          }
          
          await fetchUserRole(loginData.user.id); 
          
          toast({ title: "تم تسجيل دخول المدير بنجاح!", description: "مرحباً بك في لوحة التحكم." });
          navigate('/admin');
        }
        setIsLoading(false);
      };

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto py-12 px-4 min-h-[calc(100vh-10rem)] flex items-center justify-center"
        >
          <Card className="shadow-xl bg-white dark:bg-slate-800 w-full">
            <CardHeader className="text-center">
              <ShieldCheck className="w-16 h-16 mx-auto text-primary mb-4" />
              <CardTitle className="text-3xl font-bold gradient-text">دخول المدير</CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                الرجاء إدخال بيانات اعتماد المدير.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-lg font-medium text-gray-700 dark:text-gray-200 flex items-center"><Mail className="w-5 h-5 ml-2" />البريد الإلكتروني</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" required className="text-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-lg font-medium text-gray-700 dark:text-gray-200 flex items-center"><Lock className="w-5 h-5 ml-2" />كلمة المرور</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" required className="text-lg" />
                </div>
                {error && (
                  <div className="flex items-center text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <p>{error}</p>
                  </div>
                )}
                <Button type="submit" className="w-full text-lg py-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    'تسجيل الدخول كمدير'
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center space-y-2 pt-4">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    نسيت كلمة المرور؟
                </Link>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default AdminLoginPage;