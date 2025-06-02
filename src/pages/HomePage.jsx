
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowLeft, CloudOff, ShoppingBag, Store, CreditCard, Tv as TvIcon, Smartphone, Tablet, SearchCheck, FileLock2, Sparkles, AppWindow, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const iconMapping = {
  icloud_bypass: <FileLock2 className="w-10 h-10 md:w-12 md:h-12 text-primary mb-4" />,
  imei_check: <SearchCheck className="w-10 h-10 md:w-12 md:h-12 text-primary mb-4" />,
  app_subscription_annual: <AppWindow className="w-10 h-10 md:w-12 md:h-12 text-primary mb-4" />,
  estore_general: <Store className="w-10 h-10 md:w-12 md:h-12 text-primary mb-4" />,
  digital_cards_general: <CreditCard className="w-10 h-10 md:w-12 md:h-12 text-primary mb-4" />,
  streaming_general: <TvIcon className="w-10 h-10 md:w-12 md:h-12 text-primary mb-4" />,
  default: <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-primary mb-4" />
};

const serviceImagePlaceholders = {
  icloud_bypass: "iPhone displaying lock screen with iCloud activation message",
  imei_check: "Magnifying glass over a smartphone displaying IMEI information",
  app_subscription_annual: "Smartphone screen showing a grid of colorful app icons",
  estore_general: "Laptop screen displaying a modern e-commerce website interface",
  digital_cards_general: "Collection of various digital gift cards (iTunes, Google Play, gaming)",
  streaming_general: "TV screen displaying logos of popular streaming services like Netflix and Shahid",
  default: "Abstract technology background with glowing lines"
};

const HomePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [services, setServices] = useState([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [errorLoadingServices, setErrorLoadingServices] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoadingServices(true);
      setErrorLoadingServices(null);
      
      try {
        const { data, error } = await supabase
          .from('drmnef_services')
          .select('id, name, description, price, service_type, category, image_url')
          .order('created_at', { ascending: true });

        if (error) {
          console.error("Error fetching services for homepage:", error);
          setErrorLoadingServices(error.message);
          setServices([]);
        } else {
          setServices(data || []);
        }
      } catch (err) {
        console.error("Exception fetching services:", err);
        setErrorLoadingServices('حدث خطأ غير متوقع');
        setServices([]);
      }
      
      setIsLoadingServices(false);
    };

    fetchServices();
  }, []);

  const handleServiceNavigation = (service) => {
    const slug = service.service_type || service.name.toLowerCase().replace(/\s+/g, '-');
    
    const detailPageServices = ['estore_general', 'digital_cards_general', 'streaming_general', 'app_subscription_annual'];

    if (detailPageServices.includes(service.service_type)) {
      navigate(`/service/${slug}`);
    } else {
      navigate(`/request-service/${slug}`);
    }
  };
  
  const heroVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  return (
    <div className="space-y-12">
      <motion.section 
        className="text-center py-12 md:py-20 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 dark:from-primary/20 dark:via-purple-500/20 dark:to-pink-500/20 rounded-xl shadow-lg"
        variants={heroVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="inline-block p-4 bg-white dark:bg-slate-800 rounded-full shadow-md mb-6"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Smartphone className="w-16 h-16 text-primary" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
            <span className="gradient-text">Drmnef</span> لخدمات الأجهزة الذكية
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            نقدم حلولاً احترافية ومتخصصة لجميع مشاكل الآيفون والآيباد، بالإضافة إلى تطوير المتاجر الإلكترونية واشتراكات التطبيقات بأعلى معايير الجودة والأمان.
          </p>
          <Button size="lg" className="text-xl py-7 px-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300" onClick={() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })}>
            اكتشف خدماتنا
            <ArrowLeft className="mr-3 h-6 w-6 animate-pulse-fast" />
          </Button>
        </div>
      </motion.section>

      <section id="services-section" className="py-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 gradient-text">خدماتنا المميزة</h2>
        {isLoadingServices ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">جاري تحميل الخدمات...</p>
          </div>
        ) : errorLoadingServices ? (
            <div className="text-center py-10">
                <CloudOff className="w-16 h-16 text-destructive mx-auto mb-4" />
                <p className="text-xl text-destructive dark:text-red-400">خطأ في تحميل الخدمات.</p>
                <p className="text-md text-gray-600 dark:text-gray-400 mt-2">{errorLoadingServices}</p>
                <Button onClick={() => window.location.reload()} className="mt-4">إعادة المحاولة</Button>
            </div>
        ) : services.length === 0 ? (
          <div className="text-center py-10">
            <CloudOff className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-400">لا توجد خدمات متاحة حالياً. يرجى المحاولة لاحقاً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                className="h-full"
              >
                <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl border-transparent dark:border-slate-700/50 bg-white dark:bg-slate-800/70 backdrop-blur-sm">
                  <CardHeader className="items-center text-center p-6">
                    {iconMapping[service.service_type] || iconMapping.default}
                    <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{service.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400 min-h-[40px] line-clamp-2">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow p-6 text-center">
                    <div className="mb-4">
                      <img 
                        className="w-full h-40 object-cover rounded-lg shadow-inner" 
                        alt={serviceImagePlaceholders[service.service_type] || service.name}
                        src={service.image_url || "https://images.unsplash.com/photo-1690721606848-ac5bdcde45ea"} 
                      />
                    </div>
                    <p className="text-2xl font-bold text-primary mb-4">{service.price}</p>
                  </CardContent>
                  <CardFooter className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700/50">
                    <Button className="w-full text-lg py-3 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold" onClick={() => handleServiceNavigation(service)}>
                      اطلب الخدمة <ArrowLeft className="mr-2 h-5 w-5" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="py-12 bg-slate-100 dark:bg-slate-800/50 rounded-xl shadow-inner">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">لماذا تختار Drmnef؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
              <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">جودة عالية</h3>
              <p className="text-gray-600 dark:text-gray-400">نلتزم بأعلى معايير الجودة في جميع خدماتنا لضمان رضاك التام.</p>
            </div>
            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
              <FileLock2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">أمان وموثوقية</h3>
              <p className="text-gray-600 dark:text-gray-400">بياناتك وخصوصيتك هي أولويتنا. نعمل بسرية تامة وأمان عالي.</p>
            </div>
            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
              <SearchCheck className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">دعم فني متميز</h3>
              <p className="text-gray-600 dark:text-gray-400">فريق دعم فني متخصص جاهز لمساعدتك والإجابة على استفساراتك.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
