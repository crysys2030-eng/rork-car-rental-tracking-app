import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Stack } from 'expo-router';
import { Plus, X, Calendar, User, Phone, CreditCard, Clock, MapPin, Trash2 } from 'lucide-react-native';
import { useRentalStore } from '@/store/rental-store';
import { VIP_CARS } from '@/data/cars';
import { Car, Customer, Rental } from '@/types/car';

export default function RentalsScreen() {
  const { cars, customers, rentals, addCustomer, addRental, updateRentalStatus, removeRental, loadData } = useRentalStore();
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [allCars, setAllCars] = useState<Car[]>([]);
  
  const [customerData, setCustomerData] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
  });

  const [rentalData, setRentalData] = useState({
    startDate: '',
    endDate: '',
    rentalType: 'days' as 'hours' | 'days',
    duration: 1,
    trackingEnabled: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const combinedCars = [...VIP_CARS, ...cars];
    const uniqueCars = combinedCars.filter(
      (car, index, self) => index === self.findIndex((c) => c.id === car.id)
    );
    setAllCars(uniqueCars.filter(car => car.available));
  }, [cars]);

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(\+351|351)?[0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const calculatePrice = (): number => {
    if (!selectedCar) return 0;
    
    const basePrice = rentalData.rentalType === 'days' 
      ? selectedCar.pricePerDay 
      : selectedCar.pricePerHour;
    
    return basePrice * rentalData.duration;
  };

  const handleBooking = () => {
    if (!selectedCar || !customerData.name || !customerData.phone || !customerData.email || !customerData.licenseNumber) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!validatePhone(customerData.phone)) {
      Alert.alert('Erro', 'Por favor, insira um número de telefone português válido.');
      return;
    }

    if (!rentalData.startDate || !rentalData.endDate) {
      Alert.alert('Erro', 'Por favor, selecione as datas de início e fim.');
      return;
    }

    const customer: Customer = {
      id: Date.now().toString(),
      name: customerData.name!,
      email: customerData.email!,
      phone: customerData.phone!,
      licenseNumber: customerData.licenseNumber!,
    };

    const rental: Rental = {
      id: Date.now().toString(),
      carId: selectedCar.id,
      customerId: customer.id,
      startDate: rentalData.startDate,
      endDate: rentalData.endDate,
      rentalType: rentalData.rentalType,
      duration: rentalData.duration,
      totalPrice: calculatePrice(),
      status: 'pending',
      trackingEnabled: rentalData.trackingEnabled,
      createdAt: new Date().toISOString(),
    };

    addCustomer(customer);
    addRental(rental);
    
    setShowBookingModal(false);
    resetForm();
    Alert.alert('Sucesso', 'Reserva criada com sucesso!');
  };

  const resetForm = () => {
    setSelectedCar(null);
    setCustomerData({
      name: '',
      email: '',
      phone: '',
      licenseNumber: '',
    });
    setRentalData({
      startDate: '',
      endDate: '',
      rentalType: 'days',
      duration: 1,
      trackingEnabled: true,
    });
  };

  const getCarById = (carId: string) => allCars.find(car => car.id === carId);
  const getCustomerById = (customerId: string) => customers.find(customer => customer.id === customerId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const renderRentalCard = ({ item }: { item: Rental }) => {
    const car = getCarById(item.carId);
    const customer = getCustomerById(item.customerId);

    if (!car || !customer) return null;

    const statusColors = {
      pending: '#f59e0b',
      active: '#22c55e',
      completed: '#3b82f6',
      cancelled: '#ef4444',
    };

    const statusLabels = {
      pending: 'Pendente',
      active: 'Ativo',
      completed: 'Concluído',
      cancelled: 'Cancelado',
    };

    return (
      <View style={styles.rentalCard}>
        <View style={styles.rentalHeader}>
          <Text style={styles.carName}>{car.brand} {car.model}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
            <Text style={styles.statusText}>{statusLabels[item.status]}</Text>
          </View>
        </View>

        <View style={styles.rentalInfo}>
          <View style={styles.infoRow}>
            <User color="#666" size={16} />
            <Text style={styles.infoText}>{customer.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Phone color="#666" size={16} />
            <Text style={styles.infoText}>{customer.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Calendar color="#666" size={16} />
            <Text style={styles.infoText}>
              {formatDate(item.startDate)} - {formatDate(item.endDate)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Clock color="#666" size={16} />
            <Text style={styles.infoText}>
              {item.duration} {item.rentalType === 'days' ? 'dias' : 'horas'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <CreditCard color="#666" size={16} />
            <Text style={styles.priceText}>€{item.totalPrice}</Text>
          </View>
          {item.trackingEnabled && (
            <View style={styles.infoRow}>
              <MapPin color="#D4AF37" size={16} />
              <Text style={[styles.infoText, { color: '#D4AF37' }]}>Tracking Ativo</Text>
            </View>
          )}
        </View>

        {item.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#22c55e' }]}
              onPress={() => updateRentalStatus(item.id, 'active')}
            >
              <Text style={styles.actionButtonText}>Aprovar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
              onPress={() => updateRentalStatus(item.id, 'cancelled')}
            >
              <Text style={styles.actionButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'active' && (
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
              onPress={() => updateRentalStatus(item.id, 'completed')}
            >
              <Text style={styles.actionButtonText}>Concluir</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
              onPress={() => {
                Alert.alert(
                  'Remover Reserva',
                  'Tem certeza que deseja remover esta reserva? O carro ficará disponível novamente.',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { 
                      text: 'Remover', 
                      style: 'destructive',
                      onPress: () => removeRental(item.id)
                    }
                  ]
                );
              }}
            >
              <Trash2 size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Remover</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderCarSelector = () => (
    <View style={styles.carSelector}>
      <Text style={styles.inputLabel}>Selecionar Veículo *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carList}>
        {allCars.map((car) => (
          <TouchableOpacity
            key={car.id}
            style={[
              styles.carOption,
              selectedCar?.id === car.id && styles.carOptionSelected
            ]}
            onPress={() => setSelectedCar(car)}
          >
            <Text style={[
              styles.carOptionText,
              selectedCar?.id === car.id && styles.carOptionTextSelected
            ]}>
              {car.brand} {car.model}
            </Text>
            <Text style={styles.carPrice}>
              €{car.pricePerDay}/dia • €{car.pricePerHour}/hora
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const activeRentals = rentals.filter(rental => rental.status === 'active');
  const pendingRentals = rentals.filter(rental => rental.status === 'pending');

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Reservas', headerShown: true }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Reservas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowBookingModal(true)}
          testID="add-booking-button"
        >
          <Plus color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={rentals}
        renderItem={renderRentalCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Calendar color="#666" size={64} />
            <Text style={styles.emptyTitle}>Nenhuma reserva ainda</Text>
            <Text style={styles.emptySubtitle}>
              Toque no botão + para criar uma nova reserva
            </Text>
          </View>
        }
      />

      {/* Booking Modal */}
      <Modal visible={showBookingModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nova Reserva</Text>
            <TouchableOpacity onPress={() => setShowBookingModal(false)}>
              <X color="#666" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {renderCarSelector()}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dados do Cliente</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome Completo *</Text>
                <TextInput
                  style={styles.input}
                  value={customerData.name}
                  onChangeText={(text) => setCustomerData({ ...customerData, name: text })}
                  placeholder="Nome do cliente"
                  testID="customer-name-input"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={customerData.email}
                  onChangeText={(text) => setCustomerData({ ...customerData, email: text })}
                  placeholder="email@exemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Telefone (Portugal) *</Text>
                <TextInput
                  style={styles.input}
                  value={customerData.phone}
                  onChangeText={(text) => setCustomerData({ ...customerData, phone: text })}
                  placeholder="+351 912 345 678"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Número da Carta de Condução *</Text>
                <TextInput
                  style={styles.input}
                  value={customerData.licenseNumber}
                  onChangeText={(text) => setCustomerData({ ...customerData, licenseNumber: text })}
                  placeholder="Número da carta"
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detalhes da Reserva</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tipo de Aluguer</Text>
                <View style={styles.rentalTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.rentalTypeOption,
                      rentalData.rentalType === 'hours' && styles.rentalTypeSelected
                    ]}
                    onPress={() => setRentalData({ ...rentalData, rentalType: 'hours' })}
                  >
                    <Text style={[
                      styles.rentalTypeText,
                      rentalData.rentalType === 'hours' && styles.rentalTypeTextSelected
                    ]}>
                      Por Horas
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.rentalTypeOption,
                      rentalData.rentalType === 'days' && styles.rentalTypeSelected
                    ]}
                    onPress={() => setRentalData({ ...rentalData, rentalType: 'days' })}
                  >
                    <Text style={[
                      styles.rentalTypeText,
                      rentalData.rentalType === 'days' && styles.rentalTypeTextSelected
                    ]}>
                      Por Dias
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Duração ({rentalData.rentalType === 'days' ? 'dias' : 'horas'})
                </Text>
                <TextInput
                  style={styles.input}
                  value={rentalData.duration.toString()}
                  onChangeText={(text) => setRentalData({ ...rentalData, duration: parseInt(text) || 1 })}
                  placeholder="1"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Data de Início *</Text>
                  <TextInput
                    style={styles.input}
                    value={rentalData.startDate}
                    onChangeText={(text) => setRentalData({ ...rentalData, startDate: text })}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Data de Fim *</Text>
                  <TextInput
                    style={styles.input}
                    value={rentalData.endDate}
                    onChangeText={(text) => setRentalData({ ...rentalData, endDate: text })}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.trackingToggle}
                onPress={() => setRentalData({ 
                  ...rentalData, 
                  trackingEnabled: !rentalData.trackingEnabled 
                })}
              >
                <View style={[
                  styles.checkbox,
                  rentalData.trackingEnabled && styles.checkboxSelected
                ]}>
                  {rentalData.trackingEnabled && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.trackingText}>Ativar tracking GPS</Text>
              </TouchableOpacity>
            </View>

            {selectedCar && (
              <View style={styles.priceSection}>
                <Text style={styles.sectionTitle}>Resumo do Preço</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>
                    {rentalData.duration} {rentalData.rentalType === 'days' ? 'dias' : 'horas'} × €
                    {rentalData.rentalType === 'days' ? selectedCar.pricePerDay : selectedCar.pricePerHour}
                  </Text>
                  <Text style={styles.totalPrice}>€{calculatePrice()}</Text>
                </View>
                <Text style={styles.priceNote}>IVA incluído (23%)</Text>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.submitButton, !selectedCar && styles.submitButtonDisabled]} 
              onPress={handleBooking}
              disabled={!selectedCar}
              testID="submit-booking"
            >
              <Text style={styles.submitButtonText}>Criar Reserva</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  addButton: {
    backgroundColor: '#D4AF37',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
  },
  rentalCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  rentalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  carName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  rentalInfo: {
    gap: 10,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#ccc',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 15,
  },
  carSelector: {
    marginBottom: 30,
  },
  carList: {
    marginTop: 10,
  },
  carOption: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginRight: 15,
    minWidth: 200,
    borderWidth: 1,
    borderColor: '#333',
  },
  carOptionSelected: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  carOptionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  carOptionTextSelected: {
    color: '#000',
  },
  carPrice: {
    fontSize: 12,
    color: '#ccc',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  halfWidth: {
    flex: 1,
  },
  rentalTypeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  rentalTypeOption: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  rentalTypeSelected: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  rentalTypeText: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: '600',
  },
  rentalTypeTextSelected: {
    color: '#000',
  },
  trackingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  checkmark: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackingText: {
    color: '#fff',
    fontSize: 16,
  },
  priceSection: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#333',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 16,
    color: '#ccc',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  priceNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: '#D4AF37',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#666',
  },
  submitButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});