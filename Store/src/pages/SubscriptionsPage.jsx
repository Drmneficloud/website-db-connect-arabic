
    import React, { useState } from 'react';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Button } from '@/components/ui/button';
    import { Label } from '@/components/ui/label';
    import { motion } from 'framer-motion';
    import { Smartphone, Info, Copy, CheckCircle } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';

    const SubscriptionsPage = () => {
      const [udid, setUdid] = useState('');
      const { toast } = useToast();

      const handleCopyUdid = () => {
        navigator.clipboard.writeText(udid)
          .then(() => {
            toast({
              title: "تم النسخ!",
              description: "تم نسخ UDID إلى الحافظة.",
              action: <CheckCircle className="text-green-500" />,
            });
          })
          .catch(err => {
            toast({
              variant: "destructive",
              title: "خطأ في النسخ",
              description: "لم نتمكن من نسخ UDID. يرجى المحاولة يدويًا.",
            });
            console.error('Failed to copy UDID: ', err);
          });
      };
      
      const udidInstructions = [
        { step: 1, text: "قم بتوصيل جهاز iPhone أو iPad بجهاز الكمبيوتر الخاص بك (Mac أو Windows)." },
        { step: 2, text: "على جهاز Mac: افتح Finder. في الشريط الجانبي، حدد جهازك. تحت علامة التبويب 'عام'، انقر على النص الموجود أسفل اسم جهازك (مثل 'iPad Pro, 128GB') حتى يظهر UDID." },
        { step: 3, text: "على جهاز Windows: افتح iTunes. حدد جهازك. في علامة التبويب 'ملخص'، انقر على 'الرقم التسلسلي' حتى يظهر UDID." },
        { step: 4, text: "انسخ UDID (عادةً ما يكون سلسلة طويلة من الأحرف والأرقام، 40 حرفًا)." },
        { step: 5, text: "الصق UDID في الحقل المخصص عند طلب الخدمة." }
      ];

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto py-8 px-4 space-y-8"
        >
          <Card className="shadow-xl bg-white dark:bg-slate-800">
            <CardHeader className="text-center">
              <Smartphone className="w-16 h-16 mx-auto text-primary mb-4" />
              <CardTitle className="text-3xl font-bold gradient-text">معلومات الاشتراكات و UDID</CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                لبعض خدمات الاشتراكات، قد نحتاج إلى معرف UDID الخاص بجهازك. إليك كيفية العثور عليه.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-100">ما هو UDID؟</h3>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  UDID (Unique Device Identifier) هو معرف فريد لجهاز iPhone أو iPad الخاص بك. يُستخدم لتسجيل جهازك لبعض الخدمات مثل توزيع التطبيقات التجريبية أو اشتراكات المطورين.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">كيفية العثور على UDID الخاص بجهازك:</h3>
                <ul className="space-y-3">
                  {udidInstructions.map(item => (
                    <li key={item.step} className="flex items-start">
                      <span className="flex-shrink-0 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 ml-2">{item.step}</span>
                      <p className="text-lg text-gray-700 dark:text-gray-300">{item.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
                <Label htmlFor="udidInput" className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-2 block">أدخل UDID الخاص بك هنا (اختياري للتحقق)</Label>
                <div className="flex space-x-2 space-x-reverse">
                  <Input 
                    id="udidInput" 
                    type="text" 
                    value={udid} 
                    onChange={(e) => setUdid(e.target.value)} 
                    placeholder="مثال: 00008020-0012345A6789002E" 
                    className="text-lg flex-grow"
                    dir="ltr" 
                  />
                  <Button variant="outline" onClick={handleCopyUdid} disabled={!udid} className="text-lg px-4 py-2">
                    <Copy className="w-5 h-5 ml-2" />
                    نسخ
                  </Button>
                </div>
                {udid && udid.length === 40 && (
                   <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center"><CheckCircle className="w-4 h-4 ml-1" /> يبدو أن طول UDID صحيح.</p>
                )}
                 {udid && udid.length !== 40 && (
                   <p className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center"><Info className="w-4 h-4 ml-1" /> يجب أن يكون UDID مكونًا من 40 حرفًا.</p>
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div className="ml-3 mr-3">
                    <p className="text-lg text-blue-700 dark:text-blue-300">
                      <strong>ملاحظة هامة:</strong> تأكد من نسخ UDID بدقة. أي خطأ في UDID قد يؤدي إلى عدم عمل الخدمة المطلوبة بشكل صحيح.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default SubscriptionsPage;
  