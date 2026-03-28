import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, Linking, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { Plus, Eye, Phone, CreditCard, AlertTriangle } from 'lucide-react-native';
import { useRentalStore } from '@/store/rental-store';
import { VIP_CARS } from '@/data/cars';
import { Car } from '@/types/car';
import { useLanguage } from '@/providers/language-provider';
import { useAuth, usePaymentGuard } from '@/providers/auth-provider';

export default function CarsScreen() {
  const { cars, loadData, rentals } = useRentalStore();
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const { hasPaymentMethod, isClient } = usePaymentGuard();
  const [allCars, setAllCars] = useState<Car[]>([]);

  const loadDataCallback = useCallback(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadDataCallback();
  }, [loadDataCallback]);

  useEffect(() => {
    const combinedCars = [...VIP_CARS, ...cars];
    const uniqueCars = combinedCars.filter(
      (car, index, self) => index === self.findIndex((c) => c.id === car.id)
    );
    setAllCars(uniqueCars);
  }, [cars]);

  const getCarStatus = (car: Car) => {
    const activeRental = rentals.find(r => r.carId === car.id && r.status === 'active');
    if (activeRental) {
      return {
        available: false,
        statusText: `${t('rentedUntil')} ${new Date(activeRental.endDate).toLocaleDateString('pt-PT')}`,
        color: '#FF5722'
      };
    }
    return {
      available: car.available,
      statusText: car.available ? t('available') : t('unavailable'),
      color: car.available ? '#4CAF50' : '#FF9800'
    };
  };

  const handleContactService = () => {
    const phoneNumber = t('servicePhone');
    if (Platform.OS === 'web') {
      Alert.alert(
        t('contactService'),
        `${t('emergencyContact')}: ${phoneNumber}`,
        [{ text: t('ok') }]
      );
    } else {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleRentPress = (carId: string) => {
    if (isClient && !hasPaymentMethod) {
      Alert.alert(
        t('paymentRequired'),
        t('paymentRequiredMessage'),
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
    router.push(`/rental-form/${carId}`);
  };

  const renderCarCard = ({ item }: { item: Car }) => {
    const status = getCarStatus(item);
    const canRent = status.available && (!isClient || hasPaymentMethod);
    
    return (
      <View style={styles.carCard}>
        <Image source={{ uri: item.image }} style={styles.carImage} />
        <View style={styles.carInfo}>
          <View style={styles.carHeader}>
            <Text style={styles.carName}>{item.brand} {item.model}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
              <Text style={styles.statusText}>{status.statusText}</Text>
            </View>
          </View>
          
          <Text style={styles.carDescription}>{item.description}</Text>
          
          <View style={styles.carDetails}>
            <Text style={styles.carType}>{t('vehicleType')}: {t(item.vehicleType)}</Text>
            <Text style={styles.carEngine}>{t('engine')}: {item.engine}</Text>
            <Text style={styles.carPrice}>{t('pricePerDay')}: €{item.pricePerDay}/{t('days')}</Text>
          </View>
          
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={styles.viewButton}
              onPress={() => router.push(`/car-details/${item.id}`)}
            >
              <Eye size={16} color="#2196F3" />
              <Text style={styles.viewButtonText}>{t('viewDetails')}</Text>
            </TouchableOpacity>
            
            {status.available && (
              <TouchableOpacity 
                style={[styles.rentButton, !canRent && styles.rentButtonDisabled]}
                onPress={() => handleRentPress(item.id)}
                disabled={!canRent}
              >
                <Text style={[styles.rentButtonText, !canRent && styles.rentButtonTextDisabled]}>
                  {canRent ? t('rentNow') : t('paymentRequired')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const availableCars = allCars.filter(car => {
    if (!car || typeof car !== 'object') return false;
    if (isAdmin) return true;
    return true; // Show all cars but control rental functionality
  });

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: t('cars'),
          headerStyle: { backgroundColor: '#1976D2' },
          headerTintColor: '#fff',
          headerRight: () => isAdmin ? (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push('/admin-add-car')}
            >
              <Plus size={24} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={handleContactService}
            >
              <Phone size={20} color="#fff" />
              <Text style={styles.contactText}>{t('contactService')}</Text>
            </TouchableOpacity>
          )
        }}
      />
      
      <View style={styles.content}>
        {isClient && !hasPaymentMethod && (
          <View style={styles.paymentWarning}>
            <AlertTriangle size={24} color="#FF6B6B" />
            <View style={styles.paymentWarningContent}>
              <Text style={styles.paymentWarningTitle}>{t('paymentRequired')}</Text>
              <Text style={styles.paymentWarningText}>{t('paymentRequiredMessage')}</Text>
              <TouchableOpacity 
                style={styles.addPaymentButton}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <CreditCard size={16} color="#fff" />
                <Text style={styles.addPaymentButtonText}>{t('addPaymentInfo')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <View style={styles.header}>
          <Text style={styles.title}>{t('availableVehicles')}</Text>
          <Text style={styles.subtitle}>
            {availableCars.length} {t('availableCarsCount')}
          </Text>
        </View>
        
        <FlatList
          data={availableCars}
          renderItem={renderCarCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    paddingBottom: 20,
  },
  carCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  carImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  carInfo: {
    padding: 16,
  },
  carHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  carName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  carDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  carDetails: {
    marginBottom: 16,
  },
  carType: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  carEngine: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  carPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#E3F2FD',
  },
  viewButtonText: {
    marginLeft: 4,
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  rentButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  rentButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    marginRight: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  contactText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
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
  rentButtonDisabled: {
    backgroundColor: '#ccc',
  },
  rentButtonTextDisabled: {
    color: '#666',
  },
});