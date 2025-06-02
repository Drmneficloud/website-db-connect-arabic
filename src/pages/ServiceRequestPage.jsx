import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ShoppingCart, User, Mail, Smartphone, Info, CreditCard, Banknote, Loader2, CheckCircle, AlertCircle, Tag, PackagePlus as PackageIcon, Tv as TvIcon, Edit3, FileText, ShieldQuestion, KeyRound } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import BackButton from '@/components/BackButton';

const ServiceRequestPage = ({ serviceDetails, preselectedPackage, preselectedProductId, preselectedSubscriptionPackage }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const initialFormState = {
    full_name: '',
    email: '',
    phone: '',
    udid: '',
    serial_number: '',
    imei: '',
    device_model: '',
    store_package: preselectedPackage || '',
    product_id: preselectedProductId || '',
    subscription_package: preselectedSubscriptionPackage || '',
    notes: '',
    paymentMethod: '',
    order_id_temp: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [formStatus, setFormStatus] = useState(null);
  const [bankTransferBarcodeUrl, setBankTransferBarcodeUrl] = useState('/assets/images/alrajhi-barcode-placeholder.png');

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        setFormData(prev => ({ 
          ...prev, 
          email: user.email || '',
          full_name: profile?.full_name || user.user_metadata?.full_name || ''
        }));
      };
      fetchProfile();
    }
    setFormData(prev => ({
        ...prev,
        store_package: preselectedPackage || prev.store_package,
        product_id: preselectedProductId || prev.product_id,
        subscription_package: preselectedSubscriptionPackage || prev.subscription_package,
    }));

  }, [user, preselectedPackage, preselectedProductId, preselectedSubscriptionPackage]);
  
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('bank_transfer_barcode_url') 
        .eq('id', 1)
        .single();
      if (data && data.bank_transfer_barcode_url) {
        setBankTransferBarcodeUrl(data.bank_transfer_barcode_url);
      } else if (error && error.code !== 'PGRST116') { 
        console.warn("Could not fetch bank transfer barcode URL:", error.message);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentMethodChange = (method) => {
    setFormData({ ...formData, paymentMethod: method });
  };

  const generateOrderId = () => {
    return `DRM${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serviceDetails) {
        toast({ variant: "destructive", title: "خطأ", description: "الخدمة المطلوبة غير محددة." });
        return;
    }
    if (!formData.paymentMethod) {
      toast({ variant: "destructive", title: "خطأ", description: "يرجى اختيار طريقة الدفع." });
      return;
    }

    // Enhanced validation for specific fields
    if (serviceDetails.specific_fields?.includes('udid') && !formData.udid) {
        toast({ variant: "destructive", title: "حقل مطلوب", description: "UDID مطلوب لهذه الخدمة." }); 
        return;
    }
    if (serviceDetails.specific_fields?.includes('serial_number') && !formData.serial_number) {
        toast({ variant: "destructive", title: "حقل مطلوب", description: "الرقم التسلسلي مطلوب لهذه الخدمة." }); 
        return;
    }
    if (serviceDetails.specific_fields?.includes('imei') && !formData.imei) {
        toast({ variant: "destructive", title: "حقل مطلوب", description: "IMEI مطلوب لهذه الخدمة." }); 
        return;
    }

    setIsLoading(true);
    setFormStatus(null);

    const orderId = generateOrderId();
    setFormData(prev => ({ ...prev, order_id_temp: orderId }));

    const orderData = {
      id: orderId,
      user_id: user ? user.id : null,
      customer_name: formData.full_name,
      customer_email: formData.email,
      customer_phone: formData.phone || null,
      service_id: serviceDetails.id,
      service_name: serviceDetails.name, 
      udid: serviceDetails.specific_fields?.includes('udid') ? formData.udid : null,
      serial_number: serviceDetails.specific_fields?.includes('serial_number') ? formData.serial_number : null,
      imei: serviceDetails.specific_fields?.includes('imei') ? formData.imei : null,
      device_model: serviceDetails.specific_fields?.includes('device_model') ? formData.device_model : null,
      store_package: serviceDetails.specific_fields?.includes('store_package') ? formData.store_package : null,
      product_id: serviceDetails.specific_fields?.includes('product_id') ? formData.product_id : null,
      subscription_package: serviceDetails.specific_fields?.includes('subscription_package') ? formData.subscription_package : null,
      notes: formData.notes,
      payment_method: formData.paymentMethod,
      status: 'بانتظار الدفع',
      total_amount: serviceDetails.price, 
      order_date: new Date().toISOString(),
    };
    
    const { error: insertError } = await supabase.from('drmnef_orders').insert([orderData]);

    if (insertError) {
      console.error('Error submitting order:', insertError);
      setFormStatus('error');
      toast({ variant: "destructive", title: "خطأ في إرسال الطلب", description: `فشل إرسال الطلب: ${insertError.message}` });
      setIsLoading(false);
      return;
    }
    
    if (serviceDetails.service_type === 'app_subscription_annual' && formData.udid) {
        const { error: udidError } = await supabase.from('udid_device_info').insert({
            order_id: orderId,
            udid: formData.udid,
        });
        if (udidError) {
            console.warn("Failed to save UDID info:", udidError.message);
        }
    }

    setFormStatus('success');
    toast({
      title: "تم استلام طلبك بنجاح!",
      description: `رقم طلبك هو ${orderId}. سيتم توجيهك للدفع أو تزويدك بتعليمات الدفع.`,
      duration: 7000,
    });

    if (formData.paymentMethod === 'paypal') {
      toast({ title: "توجيه إلى PayPal...", description: "سيتم توجيهك الآن إلى PayPal لإكمال الدفع (هذه ميزة تجريبية).", duration: 5000});
    }
    
    setIsLoading(false);
  };
  
  const renderServiceSpecificFields = () => {
    if (!serviceDetails || !serviceDetails.specific_fields) return null;
    
    return serviceDetails.specific_fields.map(fieldKey => {
      switch (fieldKey) {
        case 'udid':
          return (
            <div key="udid" className="space-y-2 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-md border-l-4 border-blue-500">
              <Label htmlFor="udid" className="text-lg font-medium text-blue-700 dark:text-blue-300 flex items-center"><ShieldQuestion className="w-5 h-5 ml-2" />UDID الخاص بالجهاز</Label>
              <Input id="udid" name="udid" type="text" value={formData.udid} onChange={handleChange} placeholder="أدخل UDID هنا (40 حرفًا)" required className="text-lg" dir="ltr" />
              <p className="text-sm text-blue-600 dark:text-blue-400">هذه الخدمة تتطلب UDID. <button type="button" onClick={() => navigate('/service/app_subscription_annual')} className="underline font-semibold">كيف أجد UDID؟</button></p>
            </div>
          );
        case 'serial_number':
          return (
            <div key="serial_number" className="space-y-2 p-4 bg-amber-50 dark:bg-amber-900/30 rounded-md border-l-4 border-amber-500">
              <Label htmlFor="serial_number" className="text-lg font-medium text-amber-700 dark:text-amber-300 flex items-center"><KeyRound className="w-5 h-5 ml-2" />الرقم التسلسلي (Serial Number)</Label>
              <Input id="serial_number" name="serial_number" type="text" value={formData.serial_number} onChange={handleChange} placeholder="أدخل الرقم التسلسلي للجهاز" required className="text-lg" dir="ltr" />
              <p className="text-sm text-amber-600 dark:text-amber-400">الرقم التسلسلي مطلوب لخدمات تجاوز iCloud</p>
            </div>
          );
        case 'imei':
          return (
            <div key="imei" className="space-y-2 p-4 bg-green-50 dark:bg-green-900/30 rounded-md border-l-4 border-green-500">
              <Label htmlFor="imei" className="text-lg font-medium text-green-700 dark:text-green-300 flex items-center"><FileText className="w-5 h-5 ml-2" />رقم IMEI</Label>
              <Input id="imei" name="imei" type="text" value={formData.imei} onChange={handleChange} placeholder="أدخل رقم IMEI المكون من 15 رقمًا" required className="text-lg" dir="ltr" />
              <p className="text-sm text-green-600 dark:text-green-400">رقم IMEI مطلوب للفحص والتحقق من حالة الجهاز</p>
            </div>
          );
        case 'device_model':
          return (
            <div key="device_model" className="space-y-2">
              <Label htmlFor="device_model" className="text-lg font-medium text-gray-700 dark:text-gray-200 flex items-center"><Smartphone className="w-5 h-5 ml-2" />موديل الجهاز</Label>
              <Input id="device_model" name="device_model" type="text" value={formData.device_model} onChange={handleChange} placeholder="مثال: iPhone 13 Pro Max" required className="text-lg" />
            </div>
          );
        case 'store_package':
          return (
            <div key="store_package" className="space-y-2">
              <Label htmlFor="store_package" className="text-lg font-medium text-gray-700 dark:text-gray-200 flex items-center"><PackageIcon className="w-5 h-5 ml-2" />باقة المتجر المختارة</Label>
              <Input id="store_package" name="store_package" type="text" value={formData.store_package || 'غير محدد'} onChange={handleChange} disabled={!!preselectedPackage} className="text-lg bg-slate-100 dark:bg-slate-700" />
              {!preselectedPackage && <p className="text-sm text-gray-500">يمكنك اختيار الباقة من <Link to="/service/estore_general" className="underline">صفحة خدمة إنشاء المتاجر</Link>.</p>}
            </div>
          );
        case 'product_id':
          return (
            <div key="product_id" className="space-y-2">
              <Label htmlFor="product_id" className="text-lg font-medium text-gray-700 dark:text-gray-200 flex items-center"><Tag className="w-5 h-5 ml-2" />المنتج المختار</Label>
              <Input id="product_id" name="product_id" type="text" value={formData.product_id || 'غير محدد'} onChange={handleChange} disabled={!!preselectedProductId} className="text-lg bg-slate-100 dark:bg-slate-700" />
              {!preselectedProductId && <p className="text-sm text-gray-500">يمكنك اختيار المنتج من <Link to="/service/digital_cards_general" className="underline">صفحة بطاقات الهدايا</Link>.</p>}
            </div>
          );
        case 'subscription_package':
          return (
            <div key="subscription_package" className="space-y-2">
              <Label htmlFor="subscription_package" className="text-lg font-medium text-gray-700 dark:text-gray-200 flex items-center"><TvIcon className="w-5 h-5 ml-2" />باقة الاشتراك المختارة</Label>
              <Input id="subscription_package" name="subscription_package" type="text" value={formData.subscription_package || 'غير محدد'} onChange={handleChange} disabled={!!preselectedSubscriptionPackage} className="text-lg bg-slate-100 dark:bg-slate-700" />
              {!preselectedSubscriptionPackage && <p className="text-sm text-gray-500">يمكنك اختيار الباقة من <Link to="/service/streaming_general" className="underline">صفحة اشتراكات البث</Link>.</p>}
            </div>
          );
        default:
          if (fieldKey === 'full_name' || fieldKey === 'email' || fieldKey === 'phone' || fieldKey === 'notes') return null; 
          return ( 
            <div key={fieldKey} className="space-y-2">
              <Label htmlFor={fieldKey} className="text-lg font-medium text-gray-700 dark:text-gray-200 flex items-center"><Edit3 className="w-5 h-5 ml-2" />{fieldKey.replace(/_/g, ' ')}</Label>
              <Input id={fieldKey} name={fieldKey} type="text" value={formData[fieldKey] || ''} onChange={handleChange} placeholder={`أدخل ${fieldKey.replace(/_/g, ' ')}`} className="text-lg" />
            </div>
          );
      }
    }).filter(Boolean); 
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto py-8 px-4"
    >
      <div className="mb-6">
        <BackButton />
      </div>
      
      <Card className="shadow-2xl bg-white dark:bg-slate-800/90 backdrop-blur-md border-0 rounded-2xl overflow-hidden">
        <CardHeader className="text-center border-b dark:border-slate-700 pb-8 bg-gradient-to-r from-primary/5 to-purple-500/5">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
            طلب خدمة احترافية
          </CardTitle>
          <CardDescription className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            <div className="mb-4">
              <span className="font-bold text-2xl text-primary">{serviceDetails?.name}</span>
            </div>
            <div className="bg-white dark:bg-slate-700/50 rounded-lg p-4 inline-block">
              السعر: <span className="font-bold text-2xl text-green-600">{serviceDetails?.price}</span>
            </div>
            <p className="mt-4 text-lg">نحن متخصصون في تقديم خدمات احترافية عالية الجودة في مجال التقنية والحلول الرقمية</p>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="py-10 px-8 md:px-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="full_name" className="text-xl font-semibold text-gray-700 dark:text-gray-200 flex items-center"><User className="w-6 h-6 ml-3" />الاسم الكامل</Label>
                <Input id="full_name" name="full_name" type="text" value={formData.full_name} onChange={handleChange} placeholder="اسمك الكامل" required className="text-lg py-4 rounded-xl border-2 focus:border-primary" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="email" className="text-xl font-semibold text-gray-700 dark:text-gray-200 flex items-center"><Mail className="w-6 h-6 ml-3" />البريد الإلكتروني</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="بريدك الإلكتروني" required className="text-lg py-4 rounded-xl border-2 focus:border-primary" />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="phone" className="text-xl font-semibold text-gray-700 dark:text-gray-200 flex items-center"><Smartphone className="w-6 h-6 ml-3" />رقم الهاتف (اختياري)</Label>
              <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="رقم هاتفك للتواصل السريع" className="text-lg py-4 rounded-xl border-2 focus:border-primary" />
            </div>

            <div className="space-y-6">
              {renderServiceSpecificFields()}
            </div>

            <div className="space-y-3">
              <Label htmlFor="notes" className="text-xl font-semibold text-gray-700 dark:text-gray-200 flex items-center"><Info className="w-6 h-6 ml-3" />ملاحظات إضافية (اختياري)</Label>
              <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} placeholder="أي تفاصيل إضافية أو متطلبات خاصة تود ذكرها..." rows={4} className="text-lg rounded-xl border-2 focus:border-primary" />
            </div>

            <div className="space-y-4">
              <Label className="text-xl font-semibold text-gray-700 dark:text-gray-200">اختر طريقة الدفع المفضلة:</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Button 
                  type="button" 
                  variant={formData.paymentMethod === 'paypal' ? 'default' : 'outline'} 
                  onClick={() => handlePaymentMethodChange('paypal')}
                  className="w-full py-8 text-xl flex items-center justify-center space-x-3 space-x-reverse rounded-xl border-2 hover:scale-105 transition-all duration-200"
                >
                  <CreditCard className="w-8 h-8" /> <span>PayPal - دفع آمن</span>
                </Button>
                <Button 
                  type="button" 
                  variant={formData.paymentMethod === 'bank_transfer' ? 'default' : 'outline'} 
                  onClick={() => handlePaymentMethodChange('bank_transfer')}
                  className="w-full py-8 text-xl flex items-center justify-center space-x-3 space-x-reverse rounded-xl border-2 hover:scale-105 transition-all duration-200"
                >
                  <Banknote className="w-8 h-8" /> <span>تحويل بنكي (الراجحي)</span>
                </Button>
              </div>
            </div>
            
            {formData.paymentMethod === 'bank_transfer' && !formStatus && (
              <div className="p-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl border-2 border-green-200 dark:border-green-700">
                <h4 className="font-bold text-2xl text-green-700 dark:text-green-300 mb-6 text-center">تعليمات التحويل البنكي</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl">
                      <p className="text-green-600 dark:text-green-400 text-lg"><strong>اسم البنك:</strong> مصرف الراجحي</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl">
                      <p className="text-green-600 dark:text-green-400 text-lg"><strong>اسم المستفيد:</strong> [سيتم توفيره]</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl">
                      <p className="text-green-600 dark:text-green-400 text-lg"><strong>رقم الحساب (IBAN):</strong> [سيتم توفيره]</p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border-2 border-yellow-200">
                      <p className="text-yellow-700 dark:text-yellow-400 font-semibold text-lg">⚠️ هام: يرجى إرفاق رقم الطلب في ملاحظات التحويل</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-green-600 dark:text-green-400 text-xl font-bold mb-4">باركود الدفع السريع</p>
                    <div className="bg-white p-4 rounded-2xl inline-block shadow-lg">
                      <img 
                        className="w-56 h-56 mx-auto border rounded-xl" 
                        alt="باركود بنك الراجحي للدفع"
                        src={bankTransferBarcodeUrl} 
                      />
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-4">امسح الباركود بتطبيق الراجحي للدفع السريع</p>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-lg text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl">
                    📋 ملاحظة: سيتم تأكيد طلبك وبدء العمل بعد التحقق من عملية الدفع خلال 24 ساعة
                  </p>
                </div>
              </div>
            )}
            
            {formStatus === 'success' && (
              <div className="flex items-center text-green-600 dark:text-green-400 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 p-8 rounded-2xl text-xl border-2 border-green-200">
                <CheckCircle className="w-8 h-8 mr-4 ml-3" />
                <div>
                  <p className="font-bold text-2xl mb-2">🎉 تم استلام طلبك بنجاح!</p>
                  <p className="text-lg">رقم طلبك هو: <strong className="select-all bg-green-100 dark:bg-green-800 px-3 py-1 rounded-lg">{formData.order_id_temp}</strong></p>
                  {formData.paymentMethod === 'bank_transfer' && <p className="mt-2">يرجى اتباع تعليمات التحويل البنكي أعلاه. سيتم معالجة طلبك بعد تأكيد الدفع.</p>}
                  {formData.paymentMethod === 'paypal' && <p className="mt-2">جاري توجيهك إلى PayPal...</p>}
                </div>
              </div>
            )}
            
            {formStatus === 'error' && (
              <div className="flex items-center text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-6 rounded-2xl border-2 border-red-200">
                <AlertCircle className="w-6 h-6 mr-3" />
                <p className="text-lg">حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.</p>
              </div>
            )}

            <Button type="submit" className="w-full text-2xl py-8 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold rounded-2xl shadow-2xl hover:scale-105 transition-all duration-200" disabled={isLoading || formStatus === 'success'}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-8 w-8 animate-spin" />
                  جاري إرسال طلبك الاحترافي...
                </>
              ) : formStatus === 'success' ? (
                <>
                  <CheckCircle className="mr-3 h-8 w-8" />
                  تم إرسال الطلب بنجاح ✅
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-3 h-8 w-8" />
                  إرسال الطلب والمتابعة للدفع
                </>
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="border-t dark:border-slate-700 p-8 bg-slate-50 dark:bg-slate-800/50">
          <div className="w-full text-center space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              بالنقر على "إرسال الطلب والمتابعة للدفع"، فإنك توافق على <Link to="/terms" className="underline hover:text-primary font-semibold">شروط الخدمة</Link> و <Link to="/privacy" className="underline hover:text-primary font-semibold">سياسة الخصوصية</Link>.
            </p>
            <div className="flex items-center justify-center space-x-4 space-x-reverse text-sm text-gray-500">
              <span>🔒 دفع آمن ومضمون</span>
              <span>•</span>
              <span>⚡ خدمة احترافية سريعة</span>
              <span>•</span>
              <span>🎯 دعم فني متخصص</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ServiceRequestPage;
