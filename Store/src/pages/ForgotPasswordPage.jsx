import React, { useState } from 'react';
    import { Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { motion } from 'framer-motion';
    import { Mail, KeyRound, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabaseClient';

    const ForgotPasswordPage = () => {
      const [email, setEmail] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState('');
      const [successMessage, setSuccessMessage] = useState('');
      const { toast } = useToast();

      const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`, // URL to your reset password page
        });

        setIsLoading(false);
        if (resetError) {
          setError(resetError.message);
          toast({ variant: "destructive", title: "خطأ", description: "فشل إرسال رابط إعادة تعيين كلمة المرور. تأكد من صحة البريد الإلكتروني." });
        } else {
          setSuccessMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد والبريد المزعج.');
          toast({ title: "تم الإرسال بنجاح!", description: "تحقق من بريدك الإلكتروني لإعادة تعيين كلمة المرور." });
        }
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
              <KeyRound className="w-16 h-16 mx-auto text-primary mb-4" />
              <CardTitle className="text-3xl font-bold gradient-text">نسيت كلمة المرور؟</CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                لا تقلق! أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيينها.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {successMessage ? (
                <div className="flex flex-col items-center text-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-4 rounded-md">
                  <CheckCircle className="w-12 h-12 mb-3" />
                  <p className="font-semibold text-lg">تم إرسال الرابط بنجاح!</p>
                  <p>{successMessage}</p>
                  <Button asChild className="mt-4">
                    <Link to="/login">العودة لتسجيل الدخول</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-lg font-medium text-gray-700 dark:text-gray-200 flex items-center"><Mail className="w-5 h-5 ml-2" />البريد الإلكتروني</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="text-lg" />
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
                        جاري الإرسال...
                      </>
                    ) : (
                      'إرسال رابط إعادة التعيين'
                    )}
                  </Button>
                </form>
              )}
              {!successMessage && (
                <p className="mt-6 text-center text-md text-gray-600 dark:text-gray-300">
                  تذكرت كلمة المرور؟{' '}
                  <Link to="/login" className="font-medium text-primary hover:underline">
                    تسجيل الدخول
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default ForgotPasswordPage;