import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { User, AuthState, PaymentInfo } from '@/types/car';

const STORAGE_KEY = 'auth_user';
const DEMO_USERS: User[] = [
  {
    id: 'admin-1',
    name: 'Administrador VIP',
    email: 'admin@viprentals.pt',
    phone: '+351 912 345 678',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'client-1',
    name: 'João Silva',
    email: 'joao@example.pt',
    phone: '+351 963 789 012',
    role: 'client',
    createdAt: new Date().toISOString(),
  },
];

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const loadStoredUser = useCallback(async () => {
    try {
      const storedUser = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedUser) {
        const user: User = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.log('Error loading stored user:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    loadStoredUser();
  }, [loadStoredUser]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      // Check demo users first
      let user = DEMO_USERS.find(u => u.email === email);
      
      // If not found in demo users, check registered users
      if (!user) {
        const registeredUsersKey = 'registered_users';
        const existingRegisteredUsers = await AsyncStorage.getItem(registeredUsersKey);
        if (existingRegisteredUsers) {
          const registeredUsers = JSON.parse(existingRegisteredUsers);
          user = registeredUsers.find((u: User) => u.email === email);
        }
      }
      
      if (user && password === '123456') {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.log('Login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.log('Logout error:', error);
    }
  }, []);

  const updatePaymentInfo = useCallback(async (paymentInfo: PaymentInfo): Promise<boolean> => {
    try {
      if (!authState.user) return false;
      
      const updatedUser = {
        ...authState.user,
        paymentInfo
      };
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      
      // Also update in registered users list if exists
      const registeredUsersKey = 'registered_users';
      const existingRegisteredUsers = await AsyncStorage.getItem(registeredUsersKey);
      if (existingRegisteredUsers) {
        const registeredUsers = JSON.parse(existingRegisteredUsers);
        const userIndex = registeredUsers.findIndex((u: User) => u.id === authState.user!.id);
        if (userIndex !== -1) {
          registeredUsers[userIndex] = updatedUser;
          await AsyncStorage.setItem(registeredUsersKey, JSON.stringify(registeredUsers));
        }
      }
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));
      
      return true;
    } catch (error) {
      console.log('Update payment info error:', error);
      return false;
    }
  }, [authState.user]);

  const register = useCallback(async (userData: Omit<User, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      // Check if user already exists in demo users
      const existingDemoUser = DEMO_USERS.find(u => u.email === userData.email);
      if (existingDemoUser) {
        console.log('User already exists with this email in demo users');
        return false;
      }
      
      // Check if user already exists in registered users
      const registeredUsersKey = 'registered_users';
      const existingRegisteredUsers = await AsyncStorage.getItem(registeredUsersKey);
      if (existingRegisteredUsers) {
        const registeredUsers = JSON.parse(existingRegisteredUsers);
        const existingRegisteredUser = registeredUsers.find((u: User) => u.email === userData.email);
        if (existingRegisteredUser) {
          console.log('User already exists with this email in registered users');
          return false;
        }
      }
      
      const newUser: User = {
        ...userData,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      
      // Store the new user as current user
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      
      // Also store in registered users list
      const registeredUsers = existingRegisteredUsers ? JSON.parse(existingRegisteredUsers) : [];
      registeredUsers.push(newUser);
      await AsyncStorage.setItem(registeredUsersKey, JSON.stringify(registeredUsers));
      
      setAuthState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      console.log('Registration error:', error);
      return false;
    }
  }, []);

  const getAllUsers = useCallback(async (): Promise<User[]> => {
    try {
      // Get demo users
      const demoUsers: User[] = [
        {
          id: 'admin-1',
          name: 'Administrador VIP',
          email: 'admin@viprentals.pt',
          phone: '+351 912 345 678',
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'client-1',
          name: 'João Silva',
          email: 'joao@example.pt',
          phone: '+351 963 789 012',
          role: 'client',
          createdAt: new Date().toISOString(),
        },
      ];

      // Get registered users
      const registeredUsersData = await AsyncStorage.getItem('registered_users');
      const registeredUsers: User[] = registeredUsersData ? JSON.parse(registeredUsersData) : [];
      
      return [...demoUsers, ...registeredUsers];
    } catch (error) {
      console.log('Error getting all users:', error);
      return [];
    }
  }, []);

  const createUser = useCallback(async (userData: Omit<User, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      // Check if user already exists
      const allUsers = await getAllUsers();
      const existingUser = allUsers.find(u => u.email === userData.email);
      if (existingUser) {
        return false;
      }
      
      const newUser: User = {
        ...userData,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      
      // Save to registered users
      const registeredUsersData = await AsyncStorage.getItem('registered_users');
      const registeredUsers: User[] = registeredUsersData ? JSON.parse(registeredUsersData) : [];
      registeredUsers.push(newUser);
      await AsyncStorage.setItem('registered_users', JSON.stringify(registeredUsers));
      
      return true;
    } catch (error) {
      console.log('Error creating user:', error);
      return false;
    }
  }, [getAllUsers]);

  const updateUser = useCallback(async (userId: string, userData: Partial<User>): Promise<boolean> => {
    try {
      // Only update registered users (not demo users)
      if (userId.startsWith('admin-') || userId.startsWith('client-')) {
        return false;
      }
      
      const registeredUsersData = await AsyncStorage.getItem('registered_users');
      const registeredUsers: User[] = registeredUsersData ? JSON.parse(registeredUsersData) : [];
      const userIndex = registeredUsers.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        return false;
      }
      
      registeredUsers[userIndex] = { ...registeredUsers[userIndex], ...userData };
      await AsyncStorage.setItem('registered_users', JSON.stringify(registeredUsers));
      
      return true;
    } catch (error) {
      console.log('Error updating user:', error);
      return false;
    }
  }, []);

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      // Only delete registered users (not demo users)
      if (userId.startsWith('admin-') || userId.startsWith('client-')) {
        return false;
      }
      
      const registeredUsersData = await AsyncStorage.getItem('registered_users');
      const registeredUsers: User[] = registeredUsersData ? JSON.parse(registeredUsersData) : [];
      const filteredUsers = registeredUsers.filter(u => u.id !== userId);
      await AsyncStorage.setItem('registered_users', JSON.stringify(filteredUsers));
      
      return true;
    } catch (error) {
      console.log('Error deleting user:', error);
      return false;
    }
  }, []);

  return {
    ...authState,
    login,
    logout,
    register,
    updatePaymentInfo,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    isAdmin: authState.user?.role === 'admin',
    isClient: authState.user?.role === 'client',
  };
});

export const useAuthGuard = () => {
  const { isAuthenticated, isLoading } = useAuth();
  return { isAuthenticated, isLoading };
};

export const useAdminGuard = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  return { isAuthenticated: isAuthenticated && isAdmin, isLoading };
};

export const useClientGuard = () => {
  const { isAuthenticated, isClient, isLoading } = useAuth();
  return { isAuthenticated: isAuthenticated && isClient, isLoading };
};

export const usePaymentGuard = () => {
  const { user, isAuthenticated, isClient, isLoading } = useAuth();
  const hasPaymentMethod = user?.paymentInfo && 
    user.paymentInfo.cardNumber && 
    user.paymentInfo.cardHolderName && 
    user.paymentInfo.expiryDate && 
    user.paymentInfo.cvv;
  
  return { 
    isAuthenticated, 
    isClient, 
    hasPaymentMethod: !!hasPaymentMethod, 
    isLoading,
    canRentCars: isAuthenticated && isClient && hasPaymentMethod
  };
};