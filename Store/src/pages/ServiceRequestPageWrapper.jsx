import React, { useEffect, useState } from 'react';
    import { useParams, useLocation, useNavigate } from 'react-router-dom';
    import ServiceRequestPage from '@/pages/ServiceRequestPage'; // The actual form component
    import { supabase } from '@/lib/supabaseClient';
    import { Loader2, AlertCircle } from 'lucide-react';
    import { Button } from '@/components/ui/button';

    // This wrapper component fetches service details based on serviceType (slug or actual type)
    // and then renders the ServiceRequestPage with the fetched details.
    const ServiceRequestPageWrapper = () => {
      const { serviceType } = useParams();
      const location = useLocation();
      const navigate = useNavigate();
      const [serviceDetails, setServiceDetails] = useState(null);
      const [isLoading, setIsLoading] = useState(true);
      const [error, setError] = useState(null);

      // Extract query parameters (e.g., package, product_id)
      const queryParams = new URLSearchParams(location.search);
      const preselectedPackage = queryParams.get('package');
      const preselectedProductId = queryParams.get('product_id');
      const preselectedSubscriptionPackage = queryParams.get('subscription_package');


      useEffect(() => {
        const fetchService = async () => {
          if (!serviceType) {
            setError("نوع الخدمة غير محدد.");
            setIsLoading(false);
            return;
          }
          setIsLoading(true);
          setError(null);

          // Attempt to find service by service_type first, then by name if service_type is more generic
          let query = supabase.from('drmnef_services').select('*');
          
          // If serviceType is a specific type like 'icloud_bypass', 'imei_check', 'app_subscription_annual'
          // or a general type like 'estore_general', 'digital_cards_general', 'streaming_general'
          query = query.eq('service_type', serviceType);

          const { data, error: dbError } = await query.single();

          if (dbError && dbError.code === 'PGRST116') { // No rows found
             // If not found by service_type, try to find by name (slugified)
            const nameMatch = serviceType.replace(/-/g, ' ');
            const { data: nameData, error: nameError } = await supabase
              .from('drmnef_services')
              .select('*')
              .ilike('name', `%${nameMatch}%`)
              .single();
            
            if (nameError || !nameData) {
              setError(`لم يتم العثور على خدمة بالمعرف: ${serviceType}. ${nameError?.message || ''}`);
              setServiceDetails(null);
            } else {
              setServiceDetails(nameData);
            }
          } else if (dbError) {
            setError(`خطأ في جلب الخدمة: ${dbError.message}`);
            setServiceDetails(null);
          } else {
            setServiceDetails(data);
          }
          setIsLoading(false);
        };

        fetchService();
      }, [serviceType]);

      if (isLoading) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-300">جاري تحميل نموذج الطلب...</p>
          </div>
        );
      }

      if (error || !serviceDetails) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] text-center">
            <AlertCircle className="h-20 w-20 text-destructive mb-6" />
            <h1 className="text-4xl font-bold text-destructive mb-4">خطأ في تحميل الخدمة</h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
              {error || "لم نتمكن من العثور على تفاصيل الخدمة المطلوبة."}
            </p>
            <Button onClick={() => navigate('/')} className="text-lg py-3 px-6">
               العودة إلى الرئيسية
            </Button>
          </div>
        );
      }

      // Pass serviceDetails and any preselected options to the actual form component
      return (
        <ServiceRequestPage 
          serviceDetails={serviceDetails} 
          preselectedPackage={preselectedPackage}
          preselectedProductId={preselectedProductId}
          preselectedSubscriptionPackage={preselectedSubscriptionPackage}
        />
      );
    };

    export default ServiceRequestPageWrapper;