import React, { useState } from 'react';
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
} from "react-native";
import { useRentalStore } from '@/store/rental-store';
import { Calendar, User, Car, DollarSign } from 'lucide-react-native';
import { useLanguage } from '@/providers/language-provider';

export default function NewRentalModal() {
  const { cars, addCustomer, addRental } = useRentalStore();
  const { t } = useLanguage();
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const availableCars = cars.filter(car => car.available);
  const selectedCar = cars.find(car => car.id === selectedCarId);

  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    if (!selectedCar || !startDate || !endDate) return 0;
    
    const days = calculateDuration();
    return days * selectedCar.pricePerDay;
  };

  const handleSubmit = () => {
    if (!selectedCarId || !customerName || !customerEmail || !customerPhone || !licenseNumber || !startDate || !endDate) {
      console.log('Please fill all fields');
      return;
    }

    const customerId = Date.now().toString();
    const rentalId = Date.now().toString();

    // Add customer
    addCustomer({
      id: customerId,
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      licenseNumber: licenseNumber,
    });

    // Add rental
    addRental({
      id: rentalId,
      carId: selectedCarId,
      customerId: customerId,
      startDate: startDate,
      endDate: endDate,
      rentalType: 'days',
      duration: calculateDuration(),
      totalPrice: calculateTotal(),
      status: 'active',
      trackingEnabled: true,
      createdAt: new Date().toISOString(),
    });

    console.log('Rental created successfully');
    router.back();
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={true}
      onRequestClose={() => router.back()}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('newRental')}</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {/* Car Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Car color="#FFD700" size={20} />
              <Text style={styles.sectionTitle}>{t('selectVehicle')}</Text>
            </View>
            
            {availableCars.map(car => (
              <TouchableOpacity
                key={car.id}
                style={[
                  styles.carOption,
                  selectedCarId === car.id && styles.selectedCarOption
                ]}
                onPress={() => setSelectedCarId(car.id)}
              >
                <Text style={styles.carOptionText}>
                  {car.brand} {car.model} - €{car.pricePerDay}/{t('perDay').toLowerCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Customer Info */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User color="#FFD700" size={20} />
              <Text style={styles.sectionTitle}>{t('customerData')}</Text>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder={t('fullName')}
              value={customerName}
              onChangeText={setCustomerName}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder={t('email')}
              value={customerEmail}
              onChangeText={setCustomerEmail}
              keyboardType="email-address"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder={t('phone')}
              value={customerPhone}
              onChangeText={setCustomerPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder={t('licenseNumber')}
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              placeholderTextColor="#999"
            />
          </View>

          {/* Dates */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar color="#FFD700" size={20} />
              <Text style={styles.sectionTitle}>{t('duration')}</Text>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder={`${t('startDate')} (YYYY-MM-DD)`}
              value={startDate}
              onChangeText={setStartDate}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder={`${t('endDate')} (YYYY-MM-DD)`}
              value={endDate}
              onChangeText={setEndDate}
              placeholderTextColor="#999"
            />
          </View>

          {/* Total */}
          {selectedCar && startDate && endDate && (
            <View style={styles.totalSection}>
              <View style={styles.sectionHeader}>
                <DollarSign color="#FFD700" size={20} />
                <Text style={styles.sectionTitle}>{t('priceSummary')}</Text>
              </View>
              <Text style={styles.totalPrice}>
                €{calculateTotal().toLocaleString('pt-PT')}
              </Text>
              <Text style={styles.totalSubtext}>{t('vatIncluded')} (23%)</Text>
            </View>
          )}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>{t('createRental')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  closeButton: {
    fontSize: 24,
    color: '#fff',
  },
  form: {
    padding: 20,
  },
  section: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  carOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
    marginBottom: 8,
    backgroundColor: '#2A2A2A',
  },
  selectedCarOption: {
    borderColor: '#FFD700',
    backgroundColor: '#2A2A00',
  },
  carOptionText: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#2A2A2A',
    color: '#FFFFFF',
  },
  totalSection: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  totalPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  totalSubtext: {
    fontSize: 14,
    color: '#B0B0B0',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#FFD700',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});