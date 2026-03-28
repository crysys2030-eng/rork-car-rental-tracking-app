import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Calendar, Clock, User, Phone, Mail, CreditCard, AlertTriangle } from 'lucide-react-native';
import { useRentalStore } from '@/store/rental-store';
import { VIP_CARS } from '@/data/cars';
import { Car } from '@/types/car';
import { useLanguage } from '@/providers/language-provider';
import { usePaymentGuard } from '@/providers/auth-provider';

interface RentalFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  rentalType: 'days' | 'hours';
  duration: string;
}

export default function RentalFormScreen() {
  const { id } = useLocalSearchParams();
  const { cars, addRental } = useRentalStore();
  const { t } = useLanguage();
  const { hasPaymentMethod, isClient } = usePaymentGuard();
  const [car, setCar] = useState<Car | null>(null);
  const [formData, setFormData] = useState<RentalFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    startDate: '',
    endDate: '',
    rentalType: 'days',
    duration: '1',
  });
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    const allCars = [...VIP_CARS, ...cars];
    const foundCar = allCars.find(c => c.id === id);
    setCar(foundCar || null);
  }, [id, cars]);

  useEffect(() => {
    if (car && formData.duration) {
      const duration = parseInt(formData.duration) || 1;
      const price = formData.rentalType === 'days' 
        ? car.pricePerDay * duration
        : car.pricePerHour * duration;
      setTotalPrice(price);
    }
  }, [car, formData.duration, formData.rentalType]);

  const validateForm = (): boolean => {
    if (!formData.customerName.trim()) {
      Alert.alert(t('error'), t('pleaseEnterName'));
      return false;
    }
    if (!formData.customerEmail.trim() || !formData.customerEmail.includes('@')) {
      Alert.alert(t('error'), t('pleaseEnterValidEmail'));
      return false;
    }
    if (!formData.customerPhone.trim() || formData.customerPhone.length < 9) {
      Alert.alert(t('error'), t('pleaseEnterValidPhone'));
      return false;
    }
    if (!formData.startDate.trim()) {
      Alert.alert(t('error'), t('pleaseEnterStartDate'));
      return false;
    }
    if (!formData.endDate.trim()) {
      Alert.alert(t('error'), t('pleaseEnterEndDate'));
      return false;
    }
    if (!formData.duration.trim() || parseInt(formData.duration) < 1) {
      Alert.alert(t('error'), t('pleaseEnterValidDuration'));
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!car || !validateForm()) return;

    // Check if this is a VIP car (from VIP_CARS list)
    const isVipCar = VIP_CARS.some(vipCar => vipCar.id === car.id);

    // For VIP cars, payment method is mandatory for all users
    // For regular cars, payment method is only required for clients
    const requiresPayment = isVipCar || isClient;
    
    if (requiresPayment && !hasPaymentMethod) {
      const message = isVipCar 
        ? 'Carros VIP requerem método de pagamento. Por favor, adicione as informações de pagamento para continuar.'
        : t('paymentRequiredMessage');
      
      Alert.alert(
        t('paymentRequired'),
        message,
        [
          { text: t('cancel'), style: 'cancel' },
          { 
            text: t('addPaymentInfo'), 
            onPress: () => router.push('/(tabs)/profile')
          }
        ]
      );
      return;
    }

    const rental = {
      id: Date.now().toString(),
      carId: car.id,
      customerId: `customer-${Date.now()}`,
      startDate: formData.startDate,
      endDate: formData.endDate,
      rentalType: formData.rentalType,
      duration: parseInt(formData.duration),
      totalPrice,
      status: 'active' as const,
      trackingEnabled: false,
      createdAt: new Date().toISOString(),
    };

    addRental(rental);
    
    Alert.alert(
      t('success'),
      t('rentalCreatedSuccessfully'),
      [
        {
          text: t('ok'),
          onPress: () => router.push('/(tabs)/rentals'),
        },
      ]
    );
  };

  if (!car) {
    return (
      <View style={styles.container}>
        <Stack.Screen 
          options={{
            title: t('rentalForm'),
            headerStyle: { backgroundColor: '#1976D2' },
            headerTintColor: '#fff',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ArrowLeft size={24} color="#fff" />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{t('carNotFound')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: t('rentalForm'),
          headerStyle: { backgroundColor: '#1976D2' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {(() => {
            const isVipCar = VIP_CARS.some(vipCar => vipCar.id === car.id);
            const requiresPayment = isVipCar || isClient;
            const showWarning = requiresPayment && !hasPaymentMethod;
            
            if (!showWarning) return null;
            
            const warningMessage = isVipCar 
              ? 'Carros VIP requerem método de pagamento obrigatório'
              : t('paymentRequiredMessage');
            
            return (
              <View style={styles.paymentWarning}>
                <AlertTriangle size={24} color="#FF6B6B" />
                <View style={styles.paymentWarningContent}>
                  <Text style={styles.paymentWarningTitle}>
                    {isVipCar ? 'Carro VIP - Pagamento Obrigatório' : t('paymentRequired')}
                  </Text>
                  <Text style={styles.paymentWarningText}>{warningMessage}</Text>
                  <TouchableOpacity 
                    style={styles.addPaymentButton}
                    onPress={() => router.push('/(tabs)/profile')}
                  >
                    <CreditCard size={16} color="#fff" />
                    <Text style={styles.addPaymentButtonText}>{t('addPaymentInfo')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })()}
          
          <View style={styles.carSummary}>
            <Text style={styles.carTitle}>{car.brand} {car.model}</Text>
            <Text style={styles.carYear}>{car.year}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('customerInformation')}</Text>
            
            <View style={styles.inputGroup}>
              <User size={20} color="#1976D2" />
              <TextInput
                style={styles.input}
                placeholder={t('fullName')}
                value={formData.customerName}
                onChangeText={(text) => setFormData({...formData, customerName: text})}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Mail size={20} color="#1976D2" />
              <TextInput
                style={styles.input}
                placeholder={t('email')}
                value={formData.customerEmail}
                onChangeText={(text) => setFormData({...formData, customerEmail: text})}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Phone size={20} color="#1976D2" />
              <TextInput
                style={styles.input}
                placeholder={t('phoneNumber')}
                value={formData.customerPhone}
                onChangeText={(text) => setFormData({...formData, customerPhone: text})}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('rentalDetails')}</Text>
            
            <View style={styles.rentalTypeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  formData.rentalType === 'days' && styles.typeButtonActive
                ]}
                onPress={() => setFormData({...formData, rentalType: 'days'})}
              >
                <Calendar size={20} color={formData.rentalType === 'days' ? '#fff' : '#1976D2'} />
                <Text style={[
                  styles.typeButtonText,
                  formData.rentalType === 'days' && styles.typeButtonTextActive
                ]}>
                  {t('days')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  formData.rentalType === 'hours' && styles.typeButtonActive
                ]}
                onPress={() => setFormData({...formData, rentalType: 'hours'})}
              >
                <Clock size={20} color={formData.rentalType === 'hours' ? '#fff' : '#1976D2'} />
                <Text style={[
                  styles.typeButtonText,
                  formData.rentalType === 'hours' && styles.typeButtonTextActive
                ]}>
                  {t('hours')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Clock size={20} color="#1976D2" />
              <TextInput
                style={styles.input}
                placeholder={formData.rentalType === 'days' ? t('numberOfDays') : t('numberOfHours')}
                value={formData.duration}
                onChangeText={(text) => setFormData({...formData, duration: text})}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Calendar size={20} color="#1976D2" />
              <TextInput
                style={styles.input}
                placeholder={t('startDate')}
                value={formData.startDate}
                onChangeText={(text) => setFormData({...formData, startDate: text})}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Calendar size={20} color="#1976D2" />
              <TextInput
                style={styles.input}
                placeholder={t('endDate')}
                value={formData.endDate}
                onChangeText={(text) => setFormData({...formData, endDate: text})}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                {formData.rentalType === 'days' ? t('pricePerDay') : t('pricePerHour')}:
              </Text>
              <Text style={styles.priceValue}>
                €{formData.rentalType === 'days' ? car.pricePerDay : car.pricePerHour}
              </Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                {t('duration')}: {formData.duration} {formData.rentalType === 'days' ? t('days') : t('hours')}
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>{t('totalPrice')}:</Text>
              <Text style={styles.totalValue}>€{totalPrice.toFixed(2)}</Text>
            </View>
          </View>

          {(() => {
            const isVipCar = VIP_CARS.some(vipCar => vipCar.id === car.id);
            const requiresPayment = isVipCar || isClient;
            const isDisabled = requiresPayment && !hasPaymentMethod;
            
            return (
              <TouchableOpacity 
                style={[styles.submitButton, isDisabled && styles.submitButtonDisabled]} 
                onPress={handleSubmit}
                disabled={isDisabled}
              >
                <CreditCard size={20} color="#fff" />
                <Text style={[styles.submitButtonText, isDisabled && styles.submitButtonTextDisabled]}>
                  {isDisabled ? (isVipCar ? 'Adicionar Pagamento (VIP)' : t('paymentRequired')) : t('confirmRental')}
                </Text>
              </TouchableOpacity>
            );
          })()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  backButton: {
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  carSummary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  carTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  carYear: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingLeft: 12,
    color: '#333',
  },
  rentalTypeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#1976D2',
    borderRadius: 8,
    marginRight: 8,
  },
  typeButtonActive: {
    backgroundColor: '#1976D2',
  },
  typeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  priceSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  paymentWarning: {
    backgroundColor: '#2a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  paymentWarningContent: {
    flex: 1,
    marginLeft: 12,
  },
  paymentWarningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  paymentWarningText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 12,
    lineHeight: 20,
  },
  addPaymentButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  addPaymentButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonTextDisabled: {
    color: '#666',
  },
});