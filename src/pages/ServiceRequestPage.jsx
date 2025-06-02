import React, { useState, useEffect } from 'react';
    import { useNavigate, Link } from 'react-router-dom'; // Added Link import
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

    const ServiceRequestPage = ({ serviceDetails, preselectedPackage, preselectedProductId, preselectedSubscriptionPackage }) => {
      const navigate = useNavigate();
      const { toast } = useToast();
      const { user } = useAuth(); // Get current user from AuthContext

      const initialFormState = {
        full_name: '',
        email: '',
        phone: '',
        udid: '', // For app subscriptions
        serial_number: '', // For iCloud Bypass
        imei: '', // For iCloud Bypass & IMEI Check
        device_model: '', // For iCloud Bypass & IMEI Check
        store_package: preselectedPackage || '', // For eStore creation
        product_id: preselectedProductId || '', // For digital cards
        subscription_package: preselectedSubscriptionPackage || '', // For streaming
        notes: '',
        paymentMethod: '',
        order_id_temp: '', // Temporary holder for display after success
      };

      const [formData, setFormData] = useState(initialFormState);
      const [isLoading, setIsLoading] = useState(false);
      const [formStatus, setFormStatus] = useState(null); // null, 'success', 'error'
      const [bankTransferBarcodeUrl, setBankTransferBarcodeUrl] = useState('/assets/images/alrajhi-barcode-placeholder.png'); // Default placeholder

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
        if (serviceDetails.specific_fields?.includes('udid') && !formData.udid) {
            toast({ variant: "destructive", title: "حقل مطلوب", description: "UDID مطلوب لهذه الخدمة." }); return;
        }
        if (serviceDetails.specific_fields?.includes('serial_number') && !formData.serial_number) {
            toast({ variant: "destructive", title: "حقل مطلوب", description: "الرقم التسلسلي مطلوب لهذه الخدمة." }); return;
        }
        if (serviceDetails.specific_fields?.includes('imei') && !formData.imei) {
            toast({ variant: "destructive", title: "حقل مطلوب", description: "IMEI مطلوب لهذه الخدمة." }); return;
        }


        setIsLoading(true);
        setFormStatus(null);

        const orderId = generateOrderId();
        setFormData(prev => ({ ...prev, order_id_temp: orderId })); // Store for display

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
                <div key="serial_number" className="space-y-2">
                  <Label htmlFor="serial_number" className="text-lg font-medium text-gray-700 dark:text-gray-200 flex items-center"><KeyRound className="w-5 h-5 ml-2" />الرقم التسلسلي (Serial Number)</Label>
                  <Input id="serial_number" name="serial_number" type="text" value={formData.serial_number} onChange={handleChange} placeholder="أدخل الرقم التسلسلي للجهاز" required className="text-lg" dir="ltr" />
                </div>
              );
            case 'imei':
              return (
                <div key="imei" className="space-y-2">
                  <Label htmlFor="imei" className="text-lg font-medium text-gray-700 dark:text-gray-200 flex items-center"><FileText className="w-5 h-5 ml-2" />رقم IMEI</Label>
                  <Input id="imei" name="imei" type="text" value={formData.imei} onChange={handleChange} placeholder="أدخل رقم IMEI المكون من 15 رقمًا" required className="text-lg" dir="ltr" />
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
          className="max-w-3xl mx-auto py-8 px-4"
        >
          <Card className="shadow-xl bg-white dark:bg-slate-800/80 backdrop-blur-md">
            <CardHeader className="text-center border-b dark:border-slate-700 pb-6">
              <ShoppingCart className="w-16 h-16 mx-auto text-primary mb-4" />
              <CardTitle className="text-3xl font-bold gradient-text">طلب خدمة: {serviceDetails?.name}</CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                السعر: <span className="font-semibold text-primary">{serviceDetails?.price}</span>. يرجى ملء النموذج أدناه لإكمال طلبك.
              </CardDescription>
            </CardHeader>
            <CardContent className="py-8 px-6 md:px-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-lg font-medium text-gray-700 dark:text-gray-200 flex items-center"><User className="w-5 h-5 ml-2" />الاسم الكامل</Label>
                    <Input id="full_name" name="full_name" type="text" value={formData.full_name} onChange={handleChange} placeholder="اسمك" required className="text-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-lg font-medium text-gray-700 dark:text-gray-200 flex items-center"><Mail className="w-5 h-5 ml-2" />البريد الإلكتروني</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="بريدك الإلكتروني" required className="text-lg" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-lg font-medium text-gray-700 dark:text-gray-200 flex items-center"><Smartphone className="w-5 h-5 ml-2" />رقم الهاتف (اختياري)</Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="رقم هاتفك" className="text-lg" />
                </div>

                {renderServiceSpecificFields()}

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-lg font-medium text-gray-700 dark:text-gray-200">ملاحظات إضافية (اختياري)</Label>
                  <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} placeholder="أي تفاصيل إضافية تود ذكرها..." rows={3} className="text-lg" />
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-medium text-gray-700 dark:text-gray-200">اختر طريقة الدفع:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      type="button" 
                      variant={formData.paymentMethod === 'paypal' ? 'default' : 'outline'} 
                      onClick={() => handlePaymentMethodChange('paypal')}
                      className="w-full py-6 text-lg flex items-center justify-center space-x-2 space-x-reverse"
                    >
                      <CreditCard className="w-6 h-6" /> <span>PayPal</span>
                    </Button>
                    <Button 
                      type="button" 
                      variant={formData.paymentMethod === 'bank_transfer' ? 'default' : 'outline'} 
                      onClick={() => handlePaymentMethodChange('bank_transfer')}
                      className="w-full py-6 text-lg flex items-center justify-center space-x-2 space-x-reverse"
                    >
                      <Banknote className="w-6 h-6" /> <span>تحويل بنكي (الراجحي)</span>
                    </Button>
                  </div>
                </div>
                
                {formData.paymentMethod === 'bank_transfer' && !formStatus && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-md border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">تعليمات التحويل البنكي:</h4>
                    <p className="text-green-600 dark:text-green-400">يرجى تحويل المبلغ إلى الحساب التالي:</p>
                    <p className="text-green-600 dark:text-green-400"><strong>اسم البنك:</strong> مصرف الراجحي</p>
                    <p className="text-green-600 dark:text-green-400"><strong>اسم المستفيد:</strong> [اسم صاحب الحساب - سيتم توفيره]</p>
                    <p className="text-green-600 dark:text-green-400"><strong>رقم الحساب (IBAN):</strong> [رقم IBAN - سيتم توفيره]</p>
                    <p className="text-green-600 dark:text-green-400 mt-2"><strong>هام:</strong> يرجى إرفاق صورة من إيصال التحويل أو رقم الطلب في ملاحظات التحويل.</p>
                    <div className="mt-3">
                      <p className="text-green-600 dark:text-green-400"><strong>باركود الدفع (الراجحي):</strong></p>
                      <img-replace  
                        className="w-40 h-40 mt-1 border rounded-md" 
                        alt="باركود بنك الراجحي"
                        src={bankTransferBarcodeUrl} />
                    </div>
                     <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-3">ملاحظة: سيتم تأكيد طلبك بعد التحقق من عملية الدفع.</p>
                  </div>
                )}
                
                {formStatus === 'success' && (
                  <div className="flex items-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-4 rounded-md text-lg">
                    <CheckCircle className="w-6 h-6 mr-3 ml-2" />
                    <div>
                      <p className="font-semibold">تم استلام طلبك بنجاح!</p>
                      <p>رقم طلبك هو: <strong className="select-all">{formData.order_id_temp}</strong></p>
                      {formData.paymentMethod === 'bank_transfer' && <p>يرجى اتباع تعليمات التحويل البنكي أعلاه. سيتم معالجة طلبك بعد تأكيد الدفع.</p>}
                      {formData.paymentMethod === 'paypal' && <p>جاري توجيهك إلى PayPal...</p>}
                    </div>
                  </div>
                )}
                {formStatus === 'error' && (
                  <div className="flex items-center text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <p>حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.</p>
                  </div>
                )}

                <Button type="submit" className="w-full text-xl py-7 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold" disabled={isLoading || formStatus === 'success'}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      جاري إرسال الطلب...
                    </>
                  ) : formStatus === 'success' ? (
                    <>
                      <CheckCircle className="mr-2 h-6 w-6" />
                       تم إرسال الطلب بنجاح
                    </>
                  )
                  : (
                    'إرسال الطلب والدفع'
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="border-t dark:border-slate-700 p-6">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center w-full">
                بالنقر على "إرسال الطلب والدفع"، فإنك توافق على <Link to="/terms" className="underline hover:text-primary">شروط الخدمة</Link> و <Link to="/privacy" className="underline hover:text-primary">سياسة الخصوصية</Link>.
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };
    
    export default ServiceRequestPage;