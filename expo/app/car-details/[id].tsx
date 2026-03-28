import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Calendar, Users, Fuel, Cog, Car as CarIcon, Star, Eye, AlertTriangle, CreditCard } from 'lucide-react-native';
import { useRentalStore } from '@/store/rental-store';
import { VIP_CARS } from '@/data/cars';
import { Car } from '@/types/car';
import { useLanguage } from '@/providers/language-provider';
import { useAuth, usePaymentGuard } from '@/providers/auth-provider';

const { width } = Dimensions.get('window');

export default function CarDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { cars, rentals } = useRentalStore();
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const { hasPaymentMethod, isClient } = usePaymentGuard();
  const [car, setCar] = useState<Car | null>(null);
  const [showInterior, setShowInterior] = useState<boolean>(false);

  useEffect(() => {
    const allCars = [...VIP_CARS, ...cars];
    const foundCar = allCars.find(c => c.id === id);
    setCar(foundCar || null);
  }, [id, cars]);

  if (!car) {
    return (
      <View style={styles.container}>
        <Stack.Screen 
          options={{
            title: t('carDetails'),
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

  const getCarStatus = () => {
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

  const status = getCarStatus();

  const handleRentNow = () => {
    if (!status.available) return;
    
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
    
    router.push(`/rental-form/${car.id}`);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: `${car.brand} ${car.model}`,
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
        <View style={styles.imageContainer}>
          <Image source={{ uri: showInterior ? car.interiorImage : car.image }} style={styles.heroImage} />
          <View style={styles.imageControls}>
            <TouchableOpacity 
              style={[styles.imageButton, !showInterior && styles.activeImageButton]} 
              onPress={() => setShowInterior(false)}
            >
              <CarIcon size={16} color={!showInterior ? '#fff' : '#1976D2'} />
              <Text style={[styles.imageButtonText, !showInterior && styles.activeImageButtonText]}>
                {t('exterior')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.imageButton, showInterior && styles.activeImageButton]} 
              onPress={() => setShowInterior(true)}
            >
              <Eye size={16} color={showInterior ? '#fff' : '#1976D2'} />
              <Text style={[styles.imageButtonText, showInterior && styles.activeImageButtonText]}>
                {t('interior')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
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
            <View style={styles.titleSection}>
              <Text style={styles.carTitle}>{car.brand} {car.model}</Text>
              <Text style={styles.carYear}>{car.year}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
              <Text style={styles.statusText}>{status.statusText}</Text>
            </View>
          </View>

          <Text style={styles.description}>{car.description}</Text>

          <View style={styles.priceSection}>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>{t('pricePerDay')}</Text>
              <Text style={styles.priceValue}>€{car.pricePerDay}</Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>{t('pricePerHour')}</Text>
              <Text style={styles.priceValue}>€{car.pricePerHour}</Text>
            </View>
          </View>

          <View style={styles.specsSection}>
            <Text style={styles.sectionTitle}>{t('specifications')}</Text>
            
            <View style={styles.specGrid}>
              <View style={styles.specItem}>
                <Cog size={20} color="#1976D2" />
                <Text style={styles.specLabel}>{t('engine')}</Text>
                <Text style={styles.specValue}>{car.engine}</Text>
              </View>
              
              <View style={styles.specItem}>
                <Star size={20} color="#1976D2" />
                <Text style={styles.specLabel}>{t('horsepower')}</Text>
                <Text style={styles.specValue}>{car.horsepower} HP</Text>
              </View>
              
              <View style={styles.specItem}>
                <Users size={20} color="#1976D2" />
                <Text style={styles.specLabel}>{t('seats')}</Text>
                <Text style={styles.specValue}>{car.seats}</Text>
              </View>
              
              <View style={styles.specItem}>
                <CarIcon size={20} color="#1976D2" />
                <Text style={styles.specLabel}>{t('doors')}</Text>
                <Text style={styles.specValue}>{car.doors}</Text>
              </View>
              
              <View style={styles.specItem}>
                <Fuel size={20} color="#1976D2" />
                <Text style={styles.specLabel}>{t('fuelType')}</Text>
                <Text style={styles.specValue}>{t(car.fuelType)}</Text>
              </View>
              
              <View style={styles.specItem}>
                <Cog size={20} color="#1976D2" />
                <Text style={styles.specLabel}>{t('transmission')}</Text>
                <Text style={styles.specValue}>{t(car.transmission)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>{t('features')}</Text>
            <View style={styles.featuresList}>
              {car.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureDot} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {status.available && (
            <TouchableOpacity 
              style={[styles.rentButton, isClient && !hasPaymentMethod && styles.rentButtonDisabled]} 
              onPress={handleRentNow}
              disabled={isClient && !hasPaymentMethod}
            >
              <Calendar size={20} color="#fff" />
              <Text style={[styles.rentButtonText, isClient && !hasPaymentMethod && styles.rentButtonTextDisabled]}>
                {isClient && !hasPaymentMethod ? t('paymentRequired') : t('rentNow')}
              </Text>
            </TouchableOpacity>
          )}

          {!status.available && (
            <View style={styles.unavailableButton}>
              <Text style={styles.unavailableText}>{t('currentlyUnavailable')}</Text>
            </View>
          )}
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
  imageContainer: {
    position: 'relative',
  },
  heroImage: {
    width: width,
    height: 250,
  },
  imageControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 4,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 2,
  },
  activeImageButton: {
    backgroundColor: '#1976D2',
  },
  imageButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
    marginLeft: 4,
  },
  activeImageButtonText: {
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
  },
  carTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  carYear: {
    fontSize: 16,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  priceSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  specsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  specGrid: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  specLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  specValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
  },
  featuresSection: {
    marginBottom: 32,
  },
  featuresList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1976D2',
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
  },
  rentButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  rentButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  unavailableButton: {
    backgroundColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  unavailableText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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