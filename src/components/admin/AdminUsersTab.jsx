import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Eye, Trash2, UserCheck, UserX } from 'lucide-react';
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
      DialogFooter,
      DialogHeader,
      DialogTitle,
    } from "@/components/ui/dialog";

    const AdminUsersTab = ({ users, setUsers }) => {
      const { toast } = useToast();
      const [selectedUser, setSelectedUser] = useState(null);
      const [isUserModalOpen, setIsUserModalOpen] = useState(false);

      const viewUserDetails = (user) => {
        setSelectedUser(user);
        setIsUserModalOpen(true);
      };

      const deleteUser = async (userId) => {
        // Note: Deleting users directly from Supabase Auth requires service_role key and admin API.
        // This example will only delete from 'profiles' table for simplicity.
        // For full user deletion, you'd call a Supabase Edge Function with admin privileges.
        const { error } = await supabase.from('profiles').delete().eq('id', userId);
        if (error) {
          toast({ variant: "destructive", title: "خطأ", description: "لم يتم حذف المستخدم من ملفات التعريف: " + error.message });
        } else {
          // Attempt to delete from auth.users (requires admin privileges not available client-side directly)
          // This part is illustrative and would typically be an Edge Function call.
          // const { error: authError } = await supabase.auth.admin.deleteUser(userId) // Requires admin client
          // if(authError) toast({ variant: "warning", title: "تنبيه", description: "تم حذف الملف الشخصي ولكن تعذر حذف المستخدم من المصادقة." });

          setUsers(users.filter(u => u.id !== userId));
          toast({ variant: "default", title: "تم حذف ملف المستخدم بنجاح!" });
        }
      };
      
      const toggleUserRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'client' : 'admin';
        const { data, error } = await supabase
          .from('profiles')
          .update({ role: newRole, updated_at: new Date().toISOString() })
          .eq('id', userId)
          .select()
          .single();

        if (error) {
          toast({ variant: "destructive", title: "خطأ", description: `لم يتم تغيير دور المستخدم: ${error.message}` });
        } else if (data) {
          setUsers(users.map(u => u.id === userId ? data : u));
          toast({ title: `تم تغيير دور المستخدم إلى ${newRole === 'admin' ? 'مدير' : 'عميل'}` });
        }
      };


      return (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">قائمة المستخدمين</CardTitle>
              <CardDescription>عرض وإدارة مستخدمي المنصة.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      {['الاسم', 'البريد الإلكتروني', 'الدور', 'تاريخ الانضمام', 'إجراءات'].map(header => (
                        <th key={header} scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800/50 divide-y divide-gray-200 dark:divide-slate-700">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{user.full_name || 'لا يوجد اسم'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.role === 'admin' ? 'مدير' : 'عميل'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(user.created_at).toLocaleDateString('ar-SA')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 space-x-reverse">
                          <Button variant="ghost" size="icon" onClick={() => viewUserDetails(user)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => toggleUserRole(user.id, user.role)}>
                            {user.role === 'admin' ? <UserX className="w-4 h-4 text-yellow-500" /> : <UserCheck className="w-4 h-4 text-green-500" />}
                          </Button>
                           {/* Deleting users can be destructive, ensure this is what's intended. */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon"><Trash2 className="w-4 h-4" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>هل أنت متأكد من حذف هذا المستخدم؟</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    لا يمكن التراجع عن هذا الإجراء. سيتم حذف ملف المستخدم. (لن يتم حذف المستخدم من نظام المصادقة مباشرة من هنا).
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteUser(user.id)}>حذف الملف الشخصي</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                 {users.length === 0 && <p className="text-center py-4 text-gray-500 dark:text-gray-400">لا يوجد مستخدمون لعرضهم حالياً.</p>}
              </div>
            </CardContent>
          </Card>

          <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>تفاصيل المستخدم: {selectedUser?.full_name || selectedUser?.email}</DialogTitle>
              </DialogHeader>
              {selectedUser && (
                <div className="py-4 space-y-2">
                  <p><strong>المعرف:</strong> {selectedUser.id}</p>
                  <p><strong>الاسم:</strong> {selectedUser.full_name || 'لا يوجد اسم'}</p>
                  <p><strong>البريد الإلكتروني:</strong> {selectedUser.email}</p>
                  <p><strong>الدور:</strong> {selectedUser.role === 'admin' ? 'مدير' : 'عميل'}</p>
                  <p><strong>تاريخ الانضمام:</strong> {new Date(selectedUser.created_at).toLocaleString('ar-SA')}</p>
                  <p><strong>آخر تحديث:</strong> {new Date(selectedUser.updated_at).toLocaleString('ar-SA')}</p>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUserModalOpen(false)}>إغلاق</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    };
    export default AdminUsersTab;