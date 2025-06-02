import React, { useState, useEffect } from 'react';
    import { Link, useNavigate, useLocation } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Home, HelpCircle, Search, User, LogIn, Settings, Moon, Sun, Smartphone, Store, MessageSquare, LogOut, ShieldCheck, ArrowLeft, Mail as MailIcon, Menu as MenuIconLucide } from 'lucide-react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { useTheme } from '@/components/ThemeProvider';
    import { useAuth } from '@/contexts/AuthContext.jsx';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
    } from "@/components/ui/dropdown-menu";

    const Layout = ({ children }) => {
      const navigate = useNavigate();
      const location = useLocation();
      const { theme, setTheme } = useTheme();
      const { user, userRole, loading, signOut: authSignOut } = useAuth();
      const { toast } = useToast();
      const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
      const [platformSettings, setPlatformSettings] = useState({ 
        whatsapp_number: '966538182861', 
        contact_email: 'Dr.mnef@Gmail.Com',
        logo_url: '/assets/images/logo-placeholder.png' 
      });


      useEffect(() => {
        const fetchPlatformSettings = async () => {
          const { data, error } = await supabase
            .from('platform_settings')
            .select('whatsapp_number, contact_email, logo_url')
            .eq('id', 1)
            .single();
          if (error && error.code !== 'PGRST116') { 
            console.warn('Error fetching platform settings for layout:', error.message);
            // Keep default values if fetch fails but not for "no rows"
          } else if (data) {
            setPlatformSettings(data);
          }
        };
        fetchPlatformSettings();
      }, []);


      const navLinks = [
        { name: 'الرئيسية', path: '/', icon: <Home className="w-5 h-5 ml-2" /> },
        { name: 'تتبع الطلب', path: '/track-order', icon: <Search className="w-5 h-5 ml-2" /> },
        { name: 'الدعم الفني', path: '/support', icon: <HelpCircle className="w-5 h-5 ml-2" /> },
      ];

      const handleSignOut = async () => {
        await authSignOut();
        toast({ title: "تم تسجيل الخروج بنجاح" });
        navigate('/login');
      };
      
      const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

      const showBackButton = location.pathname !== '/' && 
                             !location.pathname.startsWith('/admin') && 
                             !location.pathname.startsWith('/dashboard') &&
                             location.pathname !== '/login' && 
                             location.pathname !== '/register' &&
                             location.pathname !== '/forgot-password';


      return (
        <div dir="rtl" className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 text-gray-800 dark:text-gray-200">
          <header className="sticky top-0 z-50 shadow-lg bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-20">
                <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
                  {platformSettings.logo_url && platformSettings.logo_url !== '/assets/images/logo-placeholder.png' ? (
                    <img-replace src={platformSettings.logo_url} alt="Drmnef Logo" className="h-10 w-auto" />
                  ) : (
                    <Smartphone className="h-8 w-8 text-primary" /> 
                  )}
                  <h1 className="text-3xl font-bold gradient-text">Drmnef</h1>
                </Link>
                <nav className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
                  {navLinks.map((link) => (
                    <Button key={link.name} variant="ghost" onClick={() => navigate(link.path)} className="text-lg font-medium hover:text-primary transition-colors flex items-center">
                      {link.icon}
                      <span>{link.name}</span>
                    </Button>
                  ))}
                </nav>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Button variant="outline" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                  {!loading && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <User className="h-6 w-6" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-800 shadow-xl rounded-lg border border-gray-200 dark:border-slate-700">
                        {user ? (
                          <>
                            <DropdownMenuItem onClick={() => navigate(userRole === 'admin' ? '/admin' : '/dashboard')} className="flex items-center space-x-2 rtl:space-x-reverse p-3 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                              {userRole === 'admin' ? <ShieldCheck className="w-5 h-5 text-primary" /> : <Settings className="w-5 h-5 text-primary" />}
                              <span>{userRole === 'admin' ? 'لوحة تحكم المدير' : 'لوحة التحكم'}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-200 dark:bg-slate-700" />
                            <DropdownMenuItem onClick={handleSignOut} className="flex items-center space-x-2 rtl:space-x-reverse p-3 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-red-600 dark:text-red-400">
                              <LogOut className="w-5 h-5" />
                              <span>تسجيل الخروج</span>
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem onClick={() => navigate('/login')} className="flex items-center space-x-2 rtl:space-x-reverse p-3 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                              <LogIn className="w-5 h-5 text-primary" />
                              <span>تسجيل الدخول</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/register')} className="flex items-center space-x-2 rtl:space-x-reverse p-3 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                              <User className="w-5 h-5 text-primary" />
                              <span>إنشاء حساب</span>
                            </DropdownMenuItem>
                             <DropdownMenuSeparator className="bg-gray-200 dark:bg-slate-700" />
                             <DropdownMenuItem onClick={() => navigate('/admin/login')} className="flex items-center space-x-2 rtl:space-x-reverse p-3 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                              <ShieldCheck className="w-5 h-5 text-red-500" />
                              <span>دخول المدير</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Button className="md:hidden" variant="ghost" size="icon" onClick={toggleMobileMenu}>
                     <MenuIconLucide className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:hidden border-t border-gray-200 dark:border-slate-700 overflow-hidden"
                >
                  <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {navLinks.map((link) => (
                      <Button key={link.name} variant="ghost" onClick={() => { navigate(link.path); setIsMobileMenuOpen(false); }} className="w-full justify-start text-lg font-medium hover:text-primary transition-colors flex items-center">
                        {link.icon}
                        <span>{link.name}</span>
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {showBackButton && (
                <Button variant="outline" onClick={() => navigate(-1)} className="mb-6 flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                    <span>عودة</span>
                </Button>
            )}
            {children}
          </main>

          <footer className="bg-slate-800 dark:bg-slate-950 text-slate-300 dark:text-slate-400 py-12 text-center">
            <div className="container mx-auto">
              <p className="text-lg">&copy; {new Date().getFullYear()} Drmnef. جميع الحقوق محفوظة.</p>
              <p className="mt-2 text-md">نقدم حلول احترافية لخدمات الأجهزة الذكية وتطوير المتاجر.</p>
              <div className="mt-4 flex justify-center items-center space-x-4 rtl:space-x-reverse">
                <a href={`mailto:${platformSettings.contact_email || 'Dr.mnef@Gmail.Com'}`} className="hover:text-primary transition-colors"><MailIcon className="w-7 h-7" /></a>
                <a href={`https://wa.me/${(platformSettings.whatsapp_number || '966538182861').replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Smartphone className="w-7 h-7" /></a>
                <Link to="/" className="hover:text-primary transition-colors"><Store className="w-7 h-7" /></Link>
              </div>
            </div>
          </footer>

          <motion.a
            href={`https://wa.me/${(platformSettings.whatsapp_number || '966538182861').replace(/\+/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-50 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="تواصل عبر واتساب"
          >
            <MessageSquare className="w-8 h-8" />
          </motion.a>
        </div>
      );
    };
    
    export default Layout;