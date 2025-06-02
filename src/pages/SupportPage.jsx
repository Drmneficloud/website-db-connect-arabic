import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { motion } from 'framer-motion';
    import { Mail, MessageSquare, Phone, LifeBuoy, Info } from 'lucide-react';
    import { supabase } from '@/lib/supabaseClient';

    const SupportPage = () => {
      const [platformSettings, setPlatformSettings] = useState({
        contact_email: 'Dr.mnef@Gmail.Com',
        whatsapp_number: '966538182861',
      });

      useEffect(() => {
        const fetchSettings = async () => {
          const { data, error } = await supabase
            .from('platform_settings')
            .select('contact_email, whatsapp_number')
            .eq('id', 1)
            .single();
          if (data) {
            setPlatformSettings(data);
          } else if (error && error.code !== 'PGRST116') {
            console.error("Error fetching platform settings for support page:", error);
          }
        };
        fetchSettings();
      }, []);

      const whatsappLink = `https://wa.me/${platformSettings.whatsapp_number.replace(/\+/g, '')}`;

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto py-12 px-4"
        >
          <Card className="shadow-xl bg-white dark:bg-slate-800/80 backdrop-blur-md">
            <CardHeader className="text-center">
              <LifeBuoy className="w-20 h-20 mx-auto text-primary mb-6" />
              <CardTitle className="text-4xl font-bold gradient-text">الدعم الفني</CardTitle>
              <CardDescription className="text-xl text-gray-600 dark:text-gray-300 mt-2">
                نحن هنا لمساعدتك! تواصل معنا عبر القنوات التالية.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 py-10 px-6 md:px-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
                  <MessageSquare className="w-7 h-7 text-green-500 ml-3" />
                  الدردشة المباشرة عبر واتساب
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg">
                  للحصول على مساعدة سريعة وفورية، تواصل معنا مباشرة عبر واتساب. فريقنا جاهز للرد على استفساراتك وحل مشاكلك.
                </p>
                <Button 
                  size="lg" 
                  className="w-full md:w-auto text-lg py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold flex items-center justify-center"
                  onClick={() => window.open(whatsappLink, '_blank')}
                >
                  <MessageSquare className="w-5 h-5 ml-2" /> ابدأ الدردشة الآن
                </Button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                  رقم الواتساب: <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="font-mono hover:underline">{platformSettings.whatsapp_number}</a>
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
                  <Mail className="w-7 h-7 text-blue-500 ml-3" />
                  التواصل عبر البريد الإلكتروني
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg">
                  يمكنك أيضًا إرسال استفساراتك أو طلبات الدعم التفصيلية عبر البريد الإلكتروني. سنقوم بالرد عليك في أقرب وقت ممكن.
                </p>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full md:w-auto text-lg py-3 px-6 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-slate-900 flex items-center justify-center"
                  onClick={() => window.location.href = `mailto:${platformSettings.contact_email}`}
                >
                  <Mail className="w-5 h-5 ml-2" /> أرسل بريدًا إلكترونيًا
                </Button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                  البريد الإلكتروني للدعم: <a href={`mailto:${platformSettings.contact_email}`} className="font-mono hover:underline">{platformSettings.contact_email}</a>
                </p>
              </motion.div>
              
              <div className="mt-10 p-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3 mr-3">
                    <p className="text-sm text-yellow-700 dark:text-yellow-200">
                      <strong>نصيحة:</strong> عند التواصل معنا، يرجى تزويدنا بأكبر قدر ممكن من التفاصيل حول استفسارك أو المشكلة التي تواجهها (مثل رقم الطلب، نوع الجهاز، وصف المشكلة) لنسرع من عملية المساعدة.
                    </p>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default SupportPage;