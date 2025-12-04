import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/AuthService';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return null;
};

export default Index;
