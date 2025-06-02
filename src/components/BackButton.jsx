
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ className = '', variant = 'outline', size = 'sm' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <Button 
      onClick={handleBack}
      variant={variant}
      size={size}
      className={`flex items-center space-x-2 space-x-reverse ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>العودة</span>
    </Button>
  );
};

export default BackButton;
