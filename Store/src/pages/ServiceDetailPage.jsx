import React, { useState, useEffect } from 'react';
    import { useParams, useNavigate, Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { motion } from 'framer-motion';
    import { ArrowLeft, Loader2, AlertCircle, ShoppingCart, Package, CreditCard, Tv, CheckSquare, Info, Smartphone as SmartphoneIcon, FileLock2, SearchCheck, AppWindow, Store as StoreIcon, Sparkles } from 'lucide-react';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';

    const iconMapping = {
      icloud_bypass: <FileLock2 className="w-16 h-16 text-primary" />,
      imei_check: <SearchCheck className="w-16 h-16 text-primary" />,
      app_subscription_annual: <AppWindow className="w-16 h-16 text-primary" />,
      estore_general: <StoreIcon className="w-16 h-16 text-primary" />,
      digital_cards_general: <CreditCard className="w-16 h-16 text-primary" />,
      streaming_general: <Tv className="w-16 h-16 text-primary" />,
      default: <Sparkles className="w-16 h-16 text-primary" />
    };
    
    const serviceImagePlaceholders = {
      icloud_bypass: "iPhone displaying lock screen with iCloud activation message",
      imei_check: "Magnifying glass over a smartphone displaying IMEI information",
      app_subscription_annual: "Smartphone screen showing a grid of colorful app icons",
      estore_general: "Modern e-commerce website on a laptop screen",
      digital_cards_general: "Various digital gift cards like iTunes and Google Play",
      streaming_general: "TV screen showing logos of Netflix and Shahid",
      default: "Abstract representation of a digital service"
    };

    // Sample product/package data (ideally fetched or managed elsewhere)
    const estorePackages = [
      { id: 'basic', name: 'الباقة الأساسية', price: '999 SAR', features: ['تصميم متجر بسيط', 'عدد محدود من المنتجات', 'دعم فني أساسي'] },
      { id: 'advanced', name: 'الباقة المتقدمة', price: '1999 SAR', features: ['تصميم متجر احترافي', 'عدد منتجات أكبر', 'بوابات دفع متعددة', 'دعم فني متقدم'] },
      { id: 'premium', name: 'الباقة الاحترافية', price: '2999 SAR', features: ['تصميم متجر مخصص بالكامل', 'عدد منتجات غير محدود', 'ميزات تسويقية متقدمة', 'دعم فني VIP'] },
      { id: 'custom', name: 'باقة مخصصة', price: 'حسب الطلب', features: ['حلول مصممة خصيصًا لاحتياجاتك الفريدة', 'استشارة كاملة وتطوير مخصص'] }
    ];

    const digitalCards = [
      { id: 'itunes_50_sar', name: 'بطاقة آيتونز 50 ريال', price: '50 SAR', category: 'iTunes' },
      { id: 'itunes_100_sar', name: 'بطاقة آيتونز 100 ريال', price: '100 SAR', category: 'iTunes' },
      { id: 'google_play_25_usd', name: 'بطاقة جوجل بلاي 25 دولار', price: '95 SAR', category: 'Google Play' },
      { id: 'pubg_600_uc', name: 'شحن PUBG 660 UC', price: '40 SAR', category: 'Gaming' },
      { id: 'psn_20_usd', name: 'بطاقة PlayStation Store بقيمة 20$', price: '75 SAR', category: 'PlayStation' },
    ];

    const streamingPackages = [
      { id: 'netflix_standard', name: 'اشتراك نتفلكس (باقة قياسية)', price: '45 SAR/شهر', description: 'جودة HD، شاشتان في نفس الوقت.' },
      { id: 'shahid_vip', name: 'اشتراك شاهد VIP', price: '25 SAR/شهر', description: 'أعمال شاهد الأصلية، مسلسلات حصرية، بدون فواصل إعلانية.' },
      { id: 'bundle_premium', name: 'الباقة الشاملة (نتفلكس بريميوم + شاهد VIP)', price: '70 SAR/شهر', description: 'أفضل ما في المنصتين، جودة Ultra HD لنتفلكس.' },
    ];


    const ServiceDetailPage = () => {
      const { serviceSlug } = useParams();
      const navigate = useNavigate();
      const { toast } = useToast();
      const [service, setService] = useState(null);
      const [isLoading, setIsLoading] = useState(true);

      useEffect(() => {
        const fetchServiceDetails = async () => {
          setIsLoading(true);
          const { data, error } = await supabase
            .from('drmnef_services')
            .select('*')
            .or(`service_type.eq.${serviceSlug},name.ilike.%${serviceSlug.replace(/-/g, ' ')}%`)
            .single(); 

          if (error || !data) {
            console.error('Error fetching service details:', error);
            toast({ variant: "destructive", title: "خطأ", description: "لم نتمكن من العثور على الخدمة المطلوبة." });
          } else {
            setService(data);
          }
          setIsLoading(false);
        };

        if (serviceSlug) {
          fetchServiceDetails();
        } else {
          navigate('/'); 
        }
      }, [serviceSlug, navigate, toast]);

      if (isLoading) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-300">جاري تحميل تفاصيل الخدمة...</p>
          </div>
        );
      }

      if (!service) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] text-center">
            <AlertCircle className="h-20 w-20 text-destructive mb-6" />
            <h1 className="text-4xl font-bold text-destructive mb-4">الخدمة غير موجودة</h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
              عذراً، لم نتمكن من العثور على الخدمة التي تبحث عنها.
            </p>
            <Button onClick={() => navigate('/')} className="text-lg py-3 px-6">
              <ArrowLeft className="mr-2 h-5 w-5" /> العودة إلى الرئيسية
            </Button>
          </div>
        );
      }
      
      const renderServiceSpecificContent = () => {
        switch (service.service_type) {
          case 'estore_general':
            return (
              <>
                <h2 className="text-3xl font-semibold mb-6 mt-8 text-center gradient-text">باقات إنشاء المتاجر الإلكترونية</h2>
                <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                  {estorePackages.map((pkg) => (
                    <motion.div key={pkg.id} whileHover={{ y: -5 }} className="h-full">
                      <Card className="bg-slate-50 dark:bg-slate-800/60 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                        <CardHeader>
                          <CardTitle className="text-2xl text-primary">{pkg.name}</CardTitle>
                          <CardDescription className="text-lg font-semibold">{pkg.price}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                            {pkg.features.map((feature, i) => <li key={i}>{feature}</li>)}
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full text-lg py-3" onClick={() => navigate(`/request-service/${service.service_type}?package=${pkg.id}`)}>
                            اطلب هذه الباقة
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </>
            );
          case 'digital_cards_general':
            return (
              <>
                <h2 className="text-3xl font-semibold mb-6 mt-8 text-center gradient-text">بطاقات الآيتونز والألعاب المتوفرة</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-center text-lg">
                  اختر من بين مجموعة متنوعة من بطاقات الشحن للألعاب والتطبيقات. تسليم فوري وآمن.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {digitalCards.map(card => (
                     <motion.div key={card.id} whileHover={{ y: -5 }} className="h-full">
                       <Card className="bg-slate-50 dark:bg-slate-800/60 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                          <CardHeader>
                            <CardTitle className="text-xl text-primary">{card.name}</CardTitle>
                            <CardDescription className="text-sm">{card.category}</CardDescription>
                          </CardHeader>
                          <CardContent className="flex-grow">
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{card.price}</p>
                          </CardContent>
                          <CardFooter>
                            <Button className="w-full text-lg py-3" onClick={() => navigate(`/request-service/${service.service_type}?product_id=${card.id}`)}>
                              شراء البطاقة
                            </Button>
                          </CardFooter>
                       </Card>
                     </motion.div>
                  ))}
                </div>
              </>
            );
          case 'streaming_general':
             return (
              <>
                <h2 className="text-3xl font-semibold mb-6 mt-8 text-center gradient-text">باقات اشتراكات نتفلكس وشاهد</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {streamingPackages.map(pkg => (
                    <motion.div key={pkg.id} whileHover={{ y: -5 }} className="h-full">
                      <Card className="bg-slate-50 dark:bg-slate-800/60 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                        <CardHeader>
                          <CardTitle className="text-xl text-primary">{pkg.name}</CardTitle>
                          <CardDescription>{pkg.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{pkg.price}</p>
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full text-lg py-3" onClick={() => navigate(`/request-service/${service.service_type}?subscription_package=${pkg.id}`)}>
                            اشترك الآن
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </>
            );
          case 'app_subscription_annual':
            return (
              <>
                <h2 className="text-3xl font-semibold mb-6 mt-8 text-center gradient-text">تفعيل اشتراك التطبيقات السنوي</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                  لتفعيل اشتراكك السنوي في باقة التطبيقات والألعاب المميزة بدون جلبريك، نحتاج إلى رقم UDID الخاص بجهازك الآيفون أو الآيباد. هذا الرقم فريد لكل جهاز ويسمح لنا بتخصيص الاشتراك لجهازك فقط. اتبع الخطوات البسيطة التالية للحصول عليه وتثبيت ملف التعريف اللازم:
                </p>
                <Card className="bg-blue-50 dark:bg-blue-900/40 border-blue-500 border-l-4 p-6 mb-8 shadow-md">
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <Info className="h-8 w-8 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-3">خطوات الحصول على UDID وتثبيت ملف التعريف:</h3>
                      <ol className="list-decimal list-inside space-y-3 text-blue-600 dark:text-blue-300 text-md">
                        <li>
                          <strong>زيارة موقع UDID.tech:</strong> افتح متصفح سفاري على جهازك الآيفون أو الآيباد وانتقل إلى الموقع: <a href="https://udid.tech" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-blue-700 dark:hover:text-blue-200 transition-colors">https://udid.tech</a>. اضغط على "Get UDID".
                        </li>
                        <li>
                          <strong>السماح بتنزيل ملف التعريف:</strong> سيطلب منك الموقع السماح بتنزيل ملف تعريف التكوين. اضغط "سماح" (Allow).
                        </li>
                        <li>
                          <strong>تثبيت ملف التعريف:</strong> اذهب إلى "الإعدادات" (Settings) في جهازك. ستجد خيار "تم تنزيل ملف التعريف" (Profile Downloaded) في الأعلى. اضغط عليه ثم اختر "تثبيت" (Install) في الزاوية العلوية، وأدخل رمز الدخول الخاص بجهازك إذا طُلب منك. اضغط "تثبيت" مرة أخرى للتأكيد.
                        </li>
                        <li>
                          <strong>نسخ UDID:</strong> بعد التثبيت، سيعيد توجيهك المتصفح إلى صفحة تعرض رقم UDID الخاص بك. قم بنسخ هذا الرقم المكون من 40 حرفًا.
                        </li>
                        <li>
                          <strong>إكمال الطلب:</strong> عد إلى موقعنا وألصق رقم UDID في نموذج طلب الخدمة عند طلبه.
                        </li>
                      </ol>
                    </div>
                  </div>
                </Card>
                <Button size="lg" className="w-full md:w-auto text-lg py-4 px-8 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold" onClick={() => navigate(`/request-service/${service.service_type}`)}>
                  اطلب اشتراك التطبيقات الآن
                </Button>
              </>
            );
          default: // For icloud_bypass, imei_check, and any other direct services
            return (
                <div className="text-center mt-8">
                    <Button size="lg" className="w-full md:w-auto text-lg py-4 px-8 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold" onClick={() => navigate(`/request-service/${service.service_type || serviceSlug}`)}>
                        <ShoppingCart className="ml-2 h-5 w-5" /> اطلب هذه الخدمة الآن
                    </Button>
                </div>
            );
        }
      };


      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto py-8 px-4"
        >
          <Card className="shadow-2xl bg-white dark:bg-slate-800/80 backdrop-blur-lg overflow-hidden rounded-xl">
            <CardHeader className="text-center border-b dark:border-slate-700/50 pb-8 pt-10 bg-gradient-to-br from-slate-50 dark:from-slate-800 to-slate-100 dark:to-slate-800/70">
              <div className="mx-auto mb-6 p-4 bg-primary/10 dark:bg-primary/20 rounded-full w-fit shadow-md">
                {iconMapping[service.service_type] || iconMapping.default}
              </div>
              <CardTitle className="text-4xl md:text-5xl font-extrabold gradient-text">{service.name}</CardTitle>
              {service.price && service.price !== "حسب البطاقة" && service.price !== "حسب الباقة" && service.price !== "تبدأ من 999 SAR" && (
                <CardDescription className="text-2xl text-gray-700 dark:text-gray-300 mt-3">
                  السعر: <span className="font-bold text-primary">{service.price}</span>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="py-10 px-6 md:px-12">
              <div className="mb-10 text-center">
                <img-replace  
                  className="w-full max-w-md h-auto mx-auto object-contain rounded-xl shadow-xl bg-slate-100 dark:bg-slate-700/50 p-2" 
                  alt={serviceImagePlaceholders[service.service_type] || service.name}
                 src="https://images.unsplash.com/photo-1690721606848-ac5bdcde45ea" />
              </div>
              <h2 className="text-3xl font-semibold mb-4 text-gray-800 dark:text-gray-100 border-b-2 border-primary pb-2 w-fit">وصف الخدمة:</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line mb-10">
                {service.description}
              </p>
              
              {renderServiceSpecificContent()}

            </CardContent>
            <CardFooter className="border-t dark:border-slate-700/50 p-8 bg-slate-50 dark:bg-slate-800/50">
               <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg py-3 px-8 mx-auto" onClick={() => navigate('/')}>
                <ArrowLeft className="ml-2 h-5 w-5" /> تصفح جميع الخدمات
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default ServiceDetailPage;