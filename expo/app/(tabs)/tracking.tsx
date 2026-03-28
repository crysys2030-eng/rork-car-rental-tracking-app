import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  SafeAreaView,
  FlatList,
  Alert 
} from 'react-native';
import { Stack } from 'expo-router';
import * as Location from 'expo-location';
import { MapPin, Navigation, Clock, Car, RefreshCw, Users, Phone } from 'lucide-react-native';
import { useRentalStore } from '@/store/rental-store';
import { VIP_CARS } from '@/data/cars';

export default function TrackingScreen() {
  const { rentals, cars, customers, updateCarLocation, loadData } = useRentalStore();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [allCars, setAllCars] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    requestLocationPermission();
  }, []);

  useEffect(() => {
    const combinedCars = [...VIP_CARS, ...cars];
    const uniqueCars = combinedCars.filter(
      (car, index, self) => index === self.findIndex((c) => c.id === car.id)
    );
    setAllCars(uniqueCars);
  }, [cars]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'web') {
      console.log('Location tracking not available on web');
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão Negada', 'É necessário permitir acesso à localização para usar o tracking.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);
    } catch (error) {
      console.log('Error getting location permission:', error);
    }
  };

  const simulateCarMovement = (rentalId: string) => {
    // Simulate car movement with random coordinates around Lisbon
    const lisbonLat = 38.7223;
    const lisbonLng = -9.1393;
    
    const randomLat = lisbonLat + (Math.random() - 0.5) * 0.1;
    const randomLng = lisbonLng + (Math.random() - 0.5) * 0.1;
    
    updateCarLocation(rentalId, {
      latitude: randomLat,
      longitude: randomLng,
    });
  };

  const updateLocation = async (rentalId: string) => {
    setIsTracking(true);
    
    try {
      if (Platform.OS === 'web') {
        // Simulate location update for web
        simulateCarMovement(rentalId);
        Alert.alert('Sucesso', 'Localização simulada atualizada (versão web)');
      } else {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        updateCarLocation(rentalId, {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        
        Alert.alert('Sucesso', 'Localização atualizada com sucesso!');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter a localização atual.');
      console.log('Location error:', error);
    } finally {
      setIsTracking(false);
    }
  };

  const getCarById = (carId: string) => allCars.find(car => car.id === carId);
  const getCustomerById = (customerId: string) => customers.find(customer => customer.id === customerId);

  const activeRentals = rentals.filter(rental => 
    rental.status === 'active' && rental.trackingEnabled
  );

  const renderTrackingCard = ({ item }: { item: any }) => {
    const car = getCarById(item.carId);
    const customer = getCustomerById(item.customerId);

    if (!car || !customer) return null;

    const hasLocation = item.currentLocation;
    const lastUpdate = hasLocation 
      ? new Date(item.currentLocation.timestamp).toLocaleString('pt-PT')
      : 'Nunca';

    return (
      <View style={styles.trackingCard}>
        <View style={styles.cardHeader}>
          <View style={styles.carInfo}>
            <Text style={styles.carName}>{car.brand} {car.model}</Text>
            <View style={styles.customerRow}>
              <Users color="#666" size={14} />
              <Text style={styles.customerName}>{customer.name}</Text>
            </View>
            <View style={styles.customerRow}>
              <Phone color="#666" size={14} />
              <Text style={styles.customerPhone}>{customer.phone}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { 
            backgroundColor: hasLocation ? '#dcfce7' : '#fef3c7' 
          }]}>
            <MapPin color={hasLocation ? '#16a34a' : '#d97706'} size={16} />
            <Text style={[styles.statusText, { 
              color: hasLocation ? '#16a34a' : '#d97706' 
            }]}>
              {hasLocation ? 'Localizado' : 'Sem GPS'}
            </Text>
          </View>
        </View>

        {hasLocation && (
          <View style={styles.locationSection}>
            <Text style={styles.locationTitle}>Localização Atual</Text>
            <View style={styles.locationGrid}>
              <View style={styles.locationItem}>
                <Navigation color="#D4AF37" size={16} />
                <Text style={styles.locationLabel}>Latitude</Text>
                <Text style={styles.locationValue}>
                  {item.currentLocation.latitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles.locationItem}>
                <Navigation color="#D4AF37" size={16} />
                <Text style={styles.locationLabel}>Longitude</Text>
                <Text style={styles.locationValue}>
                  {item.currentLocation.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
            {item.currentLocation.address && (
              <View style={styles.addressContainer}>
                <MapPin color="#666" size={16} />
                <Text style={styles.addressText}>{item.currentLocation.address}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.lastUpdateContainer}>
            <Clock color="#666" size={16} />
            <Text style={styles.lastUpdateText}>
              Última atualização: {lastUpdate}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.updateButton, isTracking && styles.updateButtonDisabled]}
            onPress={() => updateLocation(item.id)}
            disabled={isTracking}
          >
            <RefreshCw color="#000" size={16} />
            <Text style={styles.updateButtonText}>
              {isTracking ? 'Atualizando...' : 'Atualizar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Tracking GPS', headerShown: true }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Tracking GPS</Text>
        <Text style={styles.subtitle}>
          {activeRentals.length} veículos sendo rastreados
        </Text>
      </View>

      {Platform.OS === 'web' && (
        <View style={styles.webNotice}>
          <Text style={styles.webNoticeText}>
            ⚠️ Tracking GPS simulado na versão web. Use um dispositivo móvel para GPS real.
          </Text>
        </View>
      )}

      <FlatList
        data={activeRentals}
        renderItem={renderTrackingCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Car color="#666" size={64} />
            <Text style={styles.emptyTitle}>Nenhum veículo sendo rastreado</Text>
            <Text style={styles.emptySubtitle}>
              Veículos com reservas ativas e tracking habilitado aparecerão aqui
            </Text>
          </View>
        }
      />

      {location && Platform.OS !== 'web' && (
        <View style={styles.currentLocationCard}>
          <Text style={styles.currentLocationTitle}>📍 Sua Localização</Text>
          <View style={styles.currentLocationGrid}>
            <Text style={styles.currentLocationText}>
              Lat: {location.coords.latitude.toFixed(6)}
            </Text>
            <Text style={styles.currentLocationText}>
              Lng: {location.coords.longitude.toFixed(6)}
            </Text>
          </View>
          <Text style={styles.accuracyText}>
            Precisão: ±{location.coords.accuracy?.toFixed(0)}m
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
  },
  webNotice: {
    backgroundColor: '#1a1a1a',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
  },
  webNoticeText: {
    color: '#D4AF37',
    fontSize: 14,
    lineHeight: 20,
  },
  listContainer: {
    padding: 20,
  },
  trackingCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  carInfo: {
    flex: 1,
  },
  carName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#ccc',
  },
  customerPhone: {
    fontSize: 14,
    color: '#ccc',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  locationSection: {
    backgroundColor: '#0a0a0a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 12,
  },
  locationGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 10,
  },
  locationItem: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  locationLabel: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 5,
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    padding: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#ccc',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#666',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  updateButtonDisabled: {
    backgroundColor: '#666',
  },
  updateButtonText: {
    color: '#000',
    fontSize: 14,
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
    lineHeight: 24,
  },
  currentLocationCard: {
    backgroundColor: '#1a1a1a',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  currentLocationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 12,
    textAlign: 'center',
  },
  currentLocationGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  currentLocationText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  accuracyText: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 5,
  },
});