
    import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { motion } from 'framer-motion';
    import { Search, Package, Loader2, AlertCircle } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';

    const TrackOrderPage = () => {
      const [orderId, setOrderId] = useState('');
      const [email, setEmail] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const [orderDetails, setOrderDetails] = useState(null);
      const [error, setError] = useState('');
      const { toast } = useToast();

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!orderId && !email) {
          setError('يرجى إدخال رقم الطلب أو البريد الإلكتروني.');
          return;
        }
        setError('');
        setIsLoading(true);
        setOrderDetails(null);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Example data - replace with actual API call
        if ((orderId === '12345' || email === 'test@example.com')) {
          setOrderDetails({
            id: '12345',
            serviceName: 'خدمة iCloud Bypass',
            status: 'جارٍ التنفيذ',
            estimatedCompletion: '2025-06-05',
            notes: 'تم استلام الطلب وجاري العمل عليه.',
          });
          toast({
            title: "تم العثور على الطلب",
            description: `تفاصيل الطلب #${orderId || 'المربوط بالبريد'} معروضة.`,
          });
        } else {
          setError('لم يتم العثور على طلب مطابق. يرجى التحقق من المعلومات المدخلة.');
          toast({
            variant: "destructive",
            title: "خطأ في البحث",
            description: "لم يتم العثور على طلب مطابق.",
          });
        }
        setIsLoading(false);
      };

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto py-8 px-4"
        >
          <Card className="shadow-xl bg-white dark:bg-slate-800">
            <CardHeader className="text-center">
              <Package className="w-16 h-16 mx-auto text-primary mb-4" />
              <CardTitle className="text-3xl font-bold gradient-text">تتبع طلبك</CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                أدخل رقم طلبك أو بريدك الإلكتروني لعرض حالة طلبك.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="orderId" className="text-lg font-medium text-gray-700 dark:text-gray-200">رقم الطلب</Label>
                  <Input
                    id="orderId"
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="مثال: 12345"
                    className="text-lg"
                  />
                </div>
                <div className="text-center text-gray-500 dark:text-gray-400 font-semibold">أو</div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-lg font-medium text-gray-700 dark:text-gray-200">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="مثال: user@example.com"
                    className="text-lg"
                  />
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
                      جاري البحث...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" />
                      بحث
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            {orderDetails && (
              <CardFooter className="mt-6 border-t pt-6 border-gray-200 dark:border-slate-700">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3 w-full bg-slate-50 dark:bg-slate-700/50 p-6 rounded-lg"
                >
                  <h3 className="text-2xl font-semibold text-primary">تفاصيل الطلب #{orderDetails.id}</h3>
                  <p className="text-lg"><strong className="font-medium text-gray-700 dark:text-gray-200">الخدمة:</strong> {orderDetails.serviceName}</p>
                  <p className="text-lg"><strong className="font-medium text-gray-700 dark:text-gray-200">الحالة:</strong> <span className="font-semibold text-green-600 dark:text-green-400">{orderDetails.status}</span></p>
                  <p className="text-lg"><strong className="font-medium text-gray-700 dark:text-gray-200">التسليم المتوقع:</strong> {orderDetails.estimatedCompletion}</p>
                  <p className="text-lg"><strong className="font-medium text-gray-700 dark:text-gray-200">ملاحظات:</strong> {orderDetails.notes}</p>
                </motion.div>
              </CardFooter>
            )}
          </Card>
        </motion.div>
      );
    };

    export default TrackOrderPage;
  