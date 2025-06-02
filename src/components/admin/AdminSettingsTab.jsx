import React, { useEffect, useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Palette, Link as LinkIcon, Languages, Mail, Image as ImageIcon, Loader2 } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabaseClient';

    const AdminSettingsTab = ({ platformSettings: initialSettings, setPlatformSettings: updateParentState }) => {
      const { toast } = useToast();
      const [settings, setSettings] = useState(initialSettings || {
        id: 1,
        logo_url: '',
        contact_email: 'Dr.mnef@gmail.com',
        whatsapp_number: '+966538182861',
        default_language: 'ar',
        bank_transfer_barcode_url: '',
      });
      const [isLoading, setIsLoading] = useState(false);

      useEffect(() => {
        // If initialSettings are not provided or are minimal, fetch them.
        if (!initialSettings || !initialSettings.contact_email) { 
          setIsLoading(true);
          const fetchSettings = async () => {
              const { data, error } = await supabase
                  .from('platform_settings')
                  .select('*')
                  .eq('id', 1)
                  .single();
              if (data) {
                  setSettings(data);
                  updateParentState(data); // Update parent state as well
              } else if (error && error.code !== 'PGRST116') { 
                  console.error("Error fetching settings in tab:", error);
                  toast({ variant: "destructive", title: "خطأ", description: "لم يتم تحميل الإعدادات." });
              } else {
                // No settings in DB, use defaults (already set in useState)
                // Optionally, save these defaults to DB if they don't exist
                await supabase.from('platform_settings').upsert(settings, { onConflict: 'id' });
              }
              setIsLoading(false);
          };
          fetchSettings();
        } else {
          setSettings(initialSettings); // Use provided settings
        }
      }, [initialSettings, updateParentState, toast]);


      const handleSettingsChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
      };

      const savePlatformSettings = async () => {
        setIsLoading(true);
        const settingsData = {
            ...settings,
            id: 1, 
            updated_at: new Date().toISOString()
        };

        const { data: savedData, error } = await supabase
            .from('platform_settings')
            .upsert(settingsData, { onConflict: 'id' })
            .select()
            .single();

        if (error) {
            console.error("Error saving settings:", error);
            toast({ variant: "destructive", title: "خطأ", description: "لم يتم حفظ الإعدادات: " + error.message });
        } else {
            toast({ title: "تم حفظ الإعدادات بنجاح!" });
            if (savedData) {
              setSettings(savedData); // Update local state with potentially processed data from DB
              updateParentState(savedData); // Update parent dashboard state
            }
        }
        setIsLoading(false);
      };
      
      if (isLoading && (!initialSettings || !initialSettings.contact_email)) {
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">إعدادات المنصة</CardTitle>
              <CardDescription>إدارة الإعدادات العامة للمنصة.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-3 text-lg">جاري تحميل الإعدادات...</p>
            </CardContent>
          </Card>
        );
      }

      return (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">إعدادات المنصة</CardTitle>
            <CardDescription>إدارة الإعدادات العامة للمنصة.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="logo_url" className="flex items-center"><Palette className="w-5 h-5 ml-2" />رابط الشعار</Label>
              <Input id="logo_url" name="logo_url" value={settings.logo_url || ''} onChange={handleSettingsChange} placeholder="https://example.com/logo.png" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email" className="flex items-center"><Mail className="w-5 h-5 ml-2" />بريد التواصل</Label>
              <Input id="contact_email" name="contact_email" type="email" value={settings.contact_email || ''} onChange={handleSettingsChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number" className="flex items-center"><LinkIcon className="w-5 h-5 ml-2" />رقم واتساب (مع رمز الدولة)</Label>
              <Input id="whatsapp_number" name="whatsapp_number" value={settings.whatsapp_number || ''} onChange={handleSettingsChange} placeholder="+9665XXXXXXXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_transfer_barcode_url" className="flex items-center"><ImageIcon className="w-5 h-5 ml-2" />رابط صورة باركود التحويل البنكي</Label>
              <Input id="bank_transfer_barcode_url" name="bank_transfer_barcode_url" value={settings.bank_transfer_barcode_url || ''} onChange={handleSettingsChange} placeholder="/assets/images/your-barcode.png" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_language" className="flex items-center"><Languages className="w-5 h-5 ml-2" />اللغة الافتراضية</Label>
              <select id="default_language" name="default_language" value={settings.default_language || 'ar'} onChange={handleSettingsChange} className="w-full p-2 rounded border border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200">
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            <Button onClick={savePlatformSettings} className="w-full" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> جاري الحفظ...</> : 'حفظ الإعدادات'}
            </Button>
          </CardContent>
        </Card>
      );
    };

    export default AdminSettingsTab;