import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Linking,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Car, Phone, Search, MapPin, Clock, User } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Rental, Car as CarType, User as UserType } from '@/types/car';
import { useAuth } from '@/providers/auth-provider';

interface RentalWithDetails extends Rental {
  car?: CarType;
  customer?: UserType;
}

export default function AdminRentalsScreen() {
  const { user: currentUser } = useAuth();
  const [rentals, setRentals] = useState<RentalWithDetails[]>([]);
  const [filteredRentals, setFilteredRentals] = useState<RentalWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'completed'>('all');
  const [cars, setCars] = useState<CarType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      router.back();
      return;
    }
    loadData();
  }, [currentUser]);

  useEffect(() => {
    filterRentals();
  }, [rentals, searchQuery, filterStatus]);

  const loadData = async () => {
    try {
      // Load cars
      const carsData = await AsyncStorage.getItem('cars');
      const carsArray: CarType[] = carsData ? JSON.parse(carsData) : [];
      setCars(carsArray);

      // Load users (demo + registered)
      const demoUsers: UserType[] = [
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

      const registeredUsersData = await AsyncStorage.getItem('registered_users');
      const registeredUsers: UserType[] = registeredUsersData ? JSON.parse(registeredUsersData) : [];
      const allUsers = [...demoUsers, ...registeredUsers];
      setUsers(allUsers);

      // Load rentals
      const rentalsData = await AsyncStorage.getItem('rentals');
      const rentalsArray: Rental[] = rentalsData ? JSON.parse(rentalsData) : [];

      // Combine rentals with car and customer details
      const rentalsWithDetails: RentalWithDetails[] = rentalsArray.map(rental => ({
        ...rental,
        car: carsArray.find(car => car.id === rental.carId),
        customer: allUsers.find(user => user.id === rental.customerId),
      }));

      setRentals(rentalsWithDetails);
    } catch (error) {
      console.log('Error loading data:', error);
      Alert.alert('Erro', 'Erro ao carregar dados');
    }
  };

  const filterRentals = () => {
    let filtered = rentals;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(rental =>
        rental.car?.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rental.car?.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rental.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rental.customer?.phone.includes(searchQuery) ||
        rental.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(rental => rental.status === filterStatus);
    }

    setFilteredRentals(filtered);
  };

  const handleCallCustomer = (phone: string) => {
    const phoneUrl = `tel:${phone}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Erro', 'Não é possível fazer chamadas neste dispositivo');
        }
      })
      .catch((error) => {
        console.log('Error opening phone:', error);
        Alert.alert('Erro', 'Erro ao tentar ligar');
      });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'completed':
        return '#2196F3';
      case 'cancelled':
        return '#FF6B6B';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'pending':
        return 'Pendente';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderRentalCard = (rental: RentalWithDetails) => (
    <View key={rental.id} style={styles.rentalCard}>
      {/* Header */}
      <View style={styles.rentalHeader}>
        <View style={styles.rentalInfo}>
          <Text style={styles.rentalId}>#{rental.id.slice(-8).toUpperCase()}</Text>
          <View style={[styles.statusTag, { backgroundColor: getStatusColor(rental.status) }]}>
            <Text style={styles.statusText}>{getStatusText(rental.status)}</Text>
          </View>
        </View>
        <Text style={styles.rentalPrice}>€{rental.totalPrice.toFixed(2)}</Text>
      </View>

      {/* Car Info */}
      <View style={styles.carSection}>
        <Car color="#FFD700" size={20} />
        <View style={styles.carInfo}>
          <Text style={styles.carName}>
            {rental.car ? `${rental.car.brand} ${rental.car.model}` : 'Carro não encontrado'}
          </Text>
          <Text style={styles.carYear}>{rental.car?.year}</Text>
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.customerSection}>
        <User color="#4CAF50" size={20} />
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>
            {rental.customer ? rental.customer.name : 'Cliente não encontrado'}
          </Text>
          <Text style={styles.customerEmail}>{rental.customer?.email}</Text>
        </View>
        {rental.customer?.phone && (
          <TouchableOpacity
            style={styles.phoneButton}
            onPress={() => handleCallCustomer(rental.customer!.phone)}
          >
            <Phone color="#FFD700" size={18} />
          </TouchableOpacity>
        )}
      </View>

      {/* Rental Details */}
      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Clock color="#666" size={16} />
          <Text style={styles.detailLabel}>Período:</Text>
          <Text style={styles.detailValue}>
            {calculateDuration(rental.startDate, rental.endDate)} dias
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <MapPin color="#666" size={16} />
          <Text style={styles.detailLabel}>Início:</Text>
          <Text style={styles.detailValue}>{formatDate(rental.startDate)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <MapPin color="#666" size={16} />
          <Text style={styles.detailLabel}>Fim:</Text>
          <Text style={styles.detailValue}>{formatDate(rental.endDate)}</Text>
        </View>

        {rental.currentLocation && (
          <View style={styles.detailRow}>
            <MapPin color="#4CAF50" size={16} />
            <Text style={styles.detailLabel}>Localização:</Text>
            <Text style={styles.detailValue}>
              {rental.currentLocation.address || 'Coordenadas disponíveis'}
            </Text>
          </View>
        )}
      </View>

      {/* Phone Number Display */}
      <View style={styles.phoneSection}>
        <Text style={styles.phoneLabel}>Telefone de Contacto:</Text>
        <TouchableOpacity
          style={styles.phoneDisplay}
          onPress={() => rental.customer?.phone && handleCallCustomer(rental.customer.phone)}
        >
          <Phone color="#FFD700" size={16} />
          <Text style={styles.phoneNumber}>{rental.customer?.phone || 'N/A'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const activeRentals = rentals.filter(r => r.status === 'active');
  const pendingRentals = rentals.filter(r => r.status === 'pending');
  const completedRentals = rentals.filter(r => r.status === 'completed');

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Alugueres Ativos',
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#FFD700',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      
      {/* Header with stats */}
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{rentals.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{activeRentals.length}</Text>
            <Text style={styles.statLabel}>Ativos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{pendingRentals.length}</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedRentals.length}</Text>
            <Text style={styles.statLabel}>Concluídos</Text>
          </View>
        </View>
      </View>

      {/* Search and filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search color="#666" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar por carro, cliente ou ID..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.filterContainer}>
          {(['all', 'active', 'pending', 'completed'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterButton, filterStatus === filter && styles.activeFilter]}
              onPress={() => setFilterStatus(filter)}
            >
              <Text style={[styles.filterText, filterStatus === filter && styles.activeFilterText]}>
                {filter === 'all' ? 'Todos' : 
                 filter === 'active' ? 'Ativos' : 
                 filter === 'pending' ? 'Pendentes' : 'Concluídos'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Rentals list */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredRentals.length === 0 ? (
          <View style={styles.emptyState}>
            <Car color="#666" size={48} />
            <Text style={styles.emptyTitle}>Nenhum aluguer encontrado</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery ? 'Tente ajustar os filtros de pesquisa' : 'Ainda não existem alugueres registados'}
            </Text>
          </View>
        ) : (
          filteredRentals.map(renderRentalCard)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  statLabel: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 5,
  },
  searchContainer: {
    padding: 20,
    paddingTop: 0,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 10,
    color: '#fff',
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#333',
  },
  activeFilter: {
    backgroundColor: '#FFD700',
  },
  filterText: {
    color: '#ccc',
    fontWeight: '500',
    fontSize: 12,
  },
  activeFilterText: {
    color: '#000',
  },
  scrollView: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  rentalCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  rentalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  rentalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rentalId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 10,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rentalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  carSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  carInfo: {
    marginLeft: 10,
    flex: 1,
  },
  carName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  carYear: {
    fontSize: 14,
    color: '#ccc',
  },
  customerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  customerInfo: {
    marginLeft: 10,
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  customerEmail: {
    fontSize: 14,
    color: '#ccc',
  },
  phoneButton: {
    padding: 8,
    backgroundColor: '#333',
    borderRadius: 20,
  },
  detailsSection: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 8,
    minWidth: 60,
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
    marginLeft: 10,
  },
  phoneSection: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  phoneLabel: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
    marginBottom: 8,
  },
  phoneDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneNumber: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});