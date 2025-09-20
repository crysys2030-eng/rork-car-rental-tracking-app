import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return null;
  }
  
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/dashboard" />;
  }
  
  return <Redirect href="/login" />;
}