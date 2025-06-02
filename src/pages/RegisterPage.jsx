import React, { useState } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { motion } from 'framer-motion';
    import { UserPlus, User, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabaseClient';

    const RegisterPage = () => {
      const [fullName, setFullName] = useState('');
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState('');
      const navigate = useNavigate();
      const { toast } = useToast();

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
          setError('كلمتا المرور غير متطابقتين.');
          toast({ variant: "destructive", title: "خطأ", description: "كلمتا المرور غير متطابقتين." });
          return;
        }
        setIsLoading(true);
        setError('');

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });

        if (signUpError) {
          setError(signUpError.message);
          toast({ variant: "destructive", title: "خطأ في إنشاء الحساب", description: signUpError.message });
          setIsLoading(false);
          return;
        }

        if (data.user) {
           // The trigger handle_new_user should create the profile.
           // We can set the role in localStorage for immediate use, though ideally this comes from the DB after login.
          localStorage.setItem('userRole', 'client');
          toast({ title: "تم إنشاء الحساب بنجاح!", description: "تم تسجيل دخولك تلقائياً. يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب." });
          navigate('/dashboard');
        } else {
            // Handle cases where user is created but session might not be active (e.g. email confirmation required)
            toast({ title: "تم إنشاء الحساب", description: "يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب." });
            navigate('/login');
        }
        
        setIsLoading(false);
      };

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto py-12 px-4"
        >
          <Card className="shadow-xl bg-white dark:bg-slate-800">
            <CardHeader className="text-center">
              <UserPlus className="w-16 h-16 mx-auto text-primary mb-4" />
              <CardTitle className="text-3xl font-bold gradient-text">إنشاء حساب جديد</CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                انضم إلينا للاستفادة من خدماتنا المميزة.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-lg font-medium text-gray-700 dark:text-gray-200 flex items-center"><User className="w-5 h-5 ml-2" />الاسم الكامل</Label>
                  <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="اسمك الكامل" required className="text-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-lg font-medium text-gray-700 dark:text-gray-200 flex items-center"><Mail className="w-5 h-5 ml-2" />البريد الإلكتروني</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="text-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-lg font-medium text-gray-700 dark:text-gray-200 flex items-center"><Lock className="w-5 h-5 ml-2" />كلمة المرور</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" required className="text-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-lg font-medium text-gray-700 dark:text-gray-200 flex items-center"><Lock className="w-5 h-5 ml-2" />تأكيد كلمة المرور</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="********" required className="text-lg" />
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
                      جاري إنشاء الحساب...
                    </>
                  ) : (
                    'إنشاء الحساب'
                  )}
                </Button>
              </form>
              <p className="mt-6 text-center text-md text-gray-600 dark:text-gray-300">
                لديك حساب بالفعل؟{' '}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  تسجيل الدخول
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default RegisterPage;