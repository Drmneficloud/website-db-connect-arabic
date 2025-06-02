import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Eye } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabaseClient';
    import {
      Dialog,
      DialogContent,
      DialogDescription,
      DialogFooter,
      DialogHeader,
      DialogTitle,
    } from "@/components/ui/dialog";

    const AdminOrdersTab = ({ orders, setOrders }) => {
      const { toast } = useToast();
      const [selectedOrder, setSelectedOrder] = useState(null);
      const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

      const handleOrderStatusChange = async (orderId, newStatus) => {
        const { data, error } = await supabase
          .from('drmnef_orders')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', orderId)
          .select()
          .single();

        if (error) {
          console.error("Error updating order status:", error);
          toast({ variant: "destructive", title: "خطأ", description: "لم يتم تحديث حالة الطلب." });
          return;
        }

        if (data) {
          const updatedOrders = orders.map(o => o.id === orderId ? data : o);
          setOrders(updatedOrders);
          toast({ title: "تم تحديث حالة الطلب بنجاح!" });
        }
      };

      const viewOrderDetails = (order) => {
        setSelectedOrder(order);
        setIsOrderModalOpen(true);
      };

      return (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">الطلبات الحالية</CardTitle>
              <CardDescription>عرض وتعديل حالة الطلبات.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      {['رقم الطلب', 'العميل', 'الخدمة', 'الحالة', 'تاريخ الطلب', 'الإجمالي', 'إجراءات'].map(header => (
                        <th key={header} scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800/50 divide-y divide-gray-200 dark:divide-slate-700">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.customer_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.service_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <select value={order.status} onChange={(e) => handleOrderStatusChange(order.id, e.target.value)} className="p-1 rounded border border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200">
                            <option value="بانتظار الدفع">بانتظار الدفع</option>
                            <option value="جارٍ التنفيذ">جارٍ التنفيذ</option>
                            <option value="تم الإكمال">تم الإكمال</option>
                            <option value="ملغي">ملغي</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(order.order_date).toLocaleDateString('ar-SA')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.total_amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 space-x-reverse">
                          <Button variant="ghost" size="sm" onClick={() => viewOrderDetails(order)}><Eye className="w-4 h-4 ml-1" /> عرض</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && <p className="text-center py-4 text-gray-500 dark:text-gray-400">لا توجد طلبات لعرضها حالياً.</p>}
              </div>
            </CardContent>
          </Card>

          <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>تفاصيل الطلب #{selectedOrder?.id}</DialogTitle>
                <DialogDescription>
                  عرض جميع تفاصيل الطلب الخاص بالعميل: {selectedOrder?.customer_name}.
                </DialogDescription>
              </DialogHeader>
              {selectedOrder && (
                <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto">
                  <p><strong>العميل:</strong> {selectedOrder.customer_name}</p>
                  <p><strong>البريد الإلكتروني:</strong> {selectedOrder.customer_email}</p>
                  {selectedOrder.customer_phone && <p><strong>الهاتف:</strong> {selectedOrder.customer_phone}</p>}
                  <p><strong>الخدمة:</strong> {selectedOrder.service_name}</p>
                  <p><strong>الحالة:</strong> {selectedOrder.status}</p>
                  <p><strong>تاريخ الطلب:</strong> {new Date(selectedOrder.order_date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  <p><strong>الإجمالي:</strong> {selectedOrder.total_amount}</p>
                  {selectedOrder.udid && <p><strong>UDID:</strong> {selectedOrder.udid}</p>}
                  {selectedOrder.notes && <p><strong>ملاحظات العميل:</strong> {selectedOrder.notes}</p>}
                  <p><strong>طريقة الدفع:</strong> {selectedOrder.payment_method === 'paypal' ? 'PayPal' : 'تحويل بنكي'}</p>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOrderModalOpen(false)}>إغلاق</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    };

    export default AdminOrdersTab;