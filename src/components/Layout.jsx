
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Menu, 
  Moon, 
  Sun, 
  User, 
  LogOut, 
  Settings, 
  Package,
  Home,
  Phone,
  ShoppingCart,
  UserPlus,
  LogIn
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/contexts/AuthContext';

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, userRole, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navigation = [
    { name: 'الرئيسية', href: '/', icon: Home },
    { name: 'تتبع الطلب', href: '/track-order', icon: Package },
    { name: 'الدعم الفني', href: '/support', icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 space-x-reverse">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-bold text-xl gradient-text">Drmnef</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* User Menu or Auth Buttons */}
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.full_name || user.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>لوحة التحكم</span>
                  </DropdownMenuItem>
                  {userRole === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>إدارة النظام</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>تسجيل الخروج</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2 space-x-reverse">
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                  <LogIn className="mr-2 h-4 w-4" />
                  تسجيل الدخول
                </Button>
                <Button size="sm" onClick={() => navigate('/auth')}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  إنشاء حساب
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-right">القائمة</SheetTitle>
                <SheetDescription className="text-right">
                  تصفح الخدمات والصفحات
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-2 space-x-reverse text-right p-2 hover:bg-accent rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                
                {user ? (
                  <>
                    <hr />
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-2 space-x-reverse text-right p-2 hover:bg-accent rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>لوحة التحكم</span>
                    </Link>
                    {userRole === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 space-x-reverse text-right p-2 hover:bg-accent rounded-md"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>إدارة النظام</span>
                      </Link>
                    )}
                    <Button 
                      variant="ghost" 
                      className="justify-start p-2"
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      تسجيل الخروج
                    </Button>
                  </>
                ) : (
                  <>
                    <hr />
                    <Button 
                      variant="ghost" 
                      className="justify-start p-2"
                      onClick={() => {
                        navigate('/auth');
                        setIsOpen(false);
                      }}
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      تسجيل الدخول
                    </Button>
                    <Button 
                      className="justify-start p-2"
                      onClick={() => {
                        navigate('/auth');
                        setIsOpen(false);
                      }}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      إنشاء حساب
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Drmnef</h3>
              <p className="text-sm text-muted-foreground">
                خدمات احترافية للأجهزة الذكية والحلول الرقمية
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link to={item.href} className="text-muted-foreground hover:text-primary">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">تواصل معنا</h4>
              <p className="text-sm text-muted-foreground">
                البريد الإلكتروني: info@drmnef.com
              </p>
              <p className="text-sm text-muted-foreground">
                الهاتف: +966 XX XXX XXXX
              </p>
            </div>
          </div>
          <hr className="my-6" />
          <div className="text-center text-sm text-muted-foreground">
            © 2024 Drmnef. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
