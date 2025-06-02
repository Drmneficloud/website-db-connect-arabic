import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { Checkbox } from '@/components/ui/checkbox';
    import { PlusCircle, Edit, Trash2 } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabaseClient';
    import {
      AlertDialog,
      AlertDialogAction,
      AlertDialogCancel,
      AlertDialogContent,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogHeader,
      AlertDialogTitle,
      AlertDialogTrigger,
    } from "@/components/ui/alert-dialog";
    import {
      Dialog,
      DialogContent,
      DialogDescription,
      DialogFooter,
      DialogHeader,
      DialogTitle,
      DialogTrigger,
    } from "@/components/ui/dialog";

    const AdminServicesTab = ({ services, setServices }) => {
      const { toast } = useToast();
      const initialServiceState = { id: '', name: '', price: '', description: '', category: '', requires_udid: false };
      const [currentService, setCurrentService] = useState(initialServiceState);
      const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
      const [isEditingService, setIsEditingService] = useState(false);

      const handleServiceFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentService({ ...currentService, [name]: type === 'checkbox' ? checked : value });
      };

      const handleSaveService = async () => {
        if (!currentService.name || !currentService.price || !currentService.category) {
            toast({ variant: "destructive", title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة (الاسم، السعر، الفئة)." });
            return;
        }

        const serviceData = {
            name: currentService.name,
            description: currentService.description,
            price: currentService.price,
            category: currentService.category,
            requires_udid: currentService.requires_udid,
            updated_at: new Date().toISOString()
        };

        if (isEditingService) {
          const { data, error } = await supabase
            .from('drmnef_services')
            .update(serviceData)
            .eq('id', currentService.id)
            .select()
            .single();
          if (error) {
            toast({ variant: "destructive", title: "خطأ", description: "لم يتم تعديل الخدمة: " + error.message });
          } else {
            setServices(services.map(s => s.id === currentService.id ? data : s));
            toast({ title: "تم تعديل الخدمة بنجاح!" });
          }
        } else {
          const { data, error } = await supabase
            .from('drmnef_services')
            .insert([{ ...serviceData, created_at: new Date().toISOString() }])
            .select()
            .single();
          if (error) {
            toast({ variant: "destructive", title: "خطأ", description: "لم يتم إضافة الخدمة: " + error.message });
          } else {
            setServices([...services, data]);
            toast({ title: "تم إضافة الخدمة بنجاح!" });
          }
        }
        setIsServiceModalOpen(false);
        setCurrentService(initialServiceState);
        setIsEditingService(false);
      };

      const editService = (service) => {
        setCurrentService(service);
        setIsEditingService(true);
        setIsServiceModalOpen(true);
      };

      const deleteService = async (serviceId) => {
        const { error } = await supabase.from('drmnef_services').delete().eq('id', serviceId);
        if (error) {
          toast({ variant: "destructive", title: "خطأ", description: "لم يتم حذف الخدمة: " + error.message });
        } else {
          setServices(services.filter(s => s.id !== serviceId));
          toast({ variant: "default", title: "تم حذف الخدمة بنجاح!" });
        }
      };

      return (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl">الخدمات المتوفرة</CardTitle>
                <CardDescription>إضافة، تعديل، وحذف الخدمات.</CardDescription>
              </div>
              <Dialog open={isServiceModalOpen} onOpenChange={(isOpen) => {
                setIsServiceModalOpen(isOpen);
                if (!isOpen) {
                    setCurrentService(initialServiceState);
                    setIsEditingService(false);
                }
              }}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setIsEditingService(false); setCurrentService(initialServiceState); setIsServiceModalOpen(true); }}><PlusCircle className="w-5 h-5 ml-2" /> إضافة خدمة جديدة</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>{isEditingService ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}</DialogTitle>
                    <DialogDescription>
                      {isEditingService ? 'قم بتعديل تفاصيل الخدمة أدناه.' : 'أدخل تفاصيل الخدمة الجديدة.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="serviceNameModal" className="text-right col-span-1">اسم الخدمة</Label>
                      <Input id="serviceNameModal" name="name" value={currentService.name} onChange={handleServiceFormChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="servicePriceModal" className="text-right col-span-1">السعر</Label>
                      <Input id="servicePriceModal" name="price" value={currentService.price} onChange={handleServiceFormChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="serviceCategoryModal" className="text-right col-span-1">الفئة</Label>
                      <Input id="serviceCategoryModal" name="category" value={currentService.category} onChange={handleServiceFormChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="serviceDescriptionModal" className="text-right col-span-1">الوصف</Label>
                      <Textarea id="serviceDescriptionModal" name="description" value={currentService.description} onChange={handleServiceFormChange} className="col-span-3" />
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse col-span-4 justify-end">
                      <Checkbox id="requires_udid" name="requires_udid" checked={currentService.requires_udid} onCheckedChange={(checked) => setCurrentService({...currentService, requires_udid: checked})} />
                      <Label htmlFor="requires_udid" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        يتطلب UDID
                      </Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsServiceModalOpen(false)}>إلغاء</Button>
                    <Button type="submit" onClick={handleSaveService}>حفظ التغييرات</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      {['اسم الخدمة', 'السعر', 'الوصف', 'الفئة', 'يتطلب UDID', 'إجراءات'].map(header => (
                        <th key={header} scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800/50 divide-y divide-gray-200 dark:divide-slate-700">
                    {services.map((service) => (
                      <tr key={service.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{service.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{service.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">{service.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{service.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{service.requires_udid ? 'نعم' : 'لا'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 space-x-reverse">
                          <Button variant="ghost" size="sm" onClick={() => editService(service)}><Edit className="w-4 h-4 ml-1" /> تعديل</Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4 ml-1" /> حذف</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                  لا يمكن التراجع عن هذا الإجراء. سيتم حذف هذه الخدمة نهائياً.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteService(service.id)}>حذف</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {services.length === 0 && <p className="text-center py-4 text-gray-500 dark:text-gray-400">لا توجد خدمات لعرضها حالياً.</p>}
              </div>
            </CardContent>
          </Card>
        </>
      );
    };

    export default AdminServicesTab;