import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Car, Customer, Rental, RentalStats } from '@/types/car';
import { VIP_CARS } from '@/data/cars';

interface RentalStore {
  cars: Car[];
  customers: Customer[];
  rentals: Rental[];
  stats: RentalStats;
  
  // Actions
  addCar: (car: Car) => void;
  updateCarAvailability: (carId: string, available: boolean) => void;
  addCustomer: (customer: Customer) => void;
  addRental: (rental: Rental) => void;
  updateRentalStatus: (rentalId: string, status: Rental['status']) => void;
  removeRental: (rentalId: string) => void;
  updateCarLocation: (rentalId: string, location: { latitude: number; longitude: number }) => void;
  calculateStats: () => void;
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
}

export const useRentalStore = create<RentalStore>((set, get) => ({
  cars: [],
  customers: [],
  rentals: [],
  stats: {
    totalRentals: 0,
    activeRentals: 0,
    totalRevenue: 0,
    availableCars: 0,
  },

  addCar: (car) => {
    set((state) => ({
      cars: [...state.cars, car],
    }));
    get().calculateStats();
    get().saveData();
  },

  updateCarAvailability: (carId, available) => {
    set((state) => ({
      cars: state.cars.map((car) =>
        car.id === carId ? { ...car, available } : car
      ),
    }));
    get().calculateStats();
    get().saveData();
  },

  addCustomer: (customer) => {
    set((state) => ({
      customers: [...state.customers, customer],
    }));
    get().saveData();
  },

  addRental: (rental) => {
    set((state) => ({
      rentals: [...state.rentals, rental],
    }));
    get().updateCarAvailability(rental.carId, false);
    get().calculateStats();
    get().saveData();
  },

  updateRentalStatus: (rentalId, status) => {
    set((state) => ({
      rentals: state.rentals.map((rental) =>
        rental.id === rentalId ? { ...rental, status } : rental
      ),
    }));
    
    // Automatically make car available when rental is completed or cancelled
    if (status === 'completed' || status === 'cancelled') {
      const rental = get().rentals.find(r => r.id === rentalId);
      if (rental) {
        get().updateCarAvailability(rental.carId, true);
      }
    }
    
    get().calculateStats();
    get().saveData();
  },

  removeRental: (rentalId) => {
    const { rentals } = get();
    const rental = rentals.find(r => r.id === rentalId);
    
    if (rental) {
      // Make the car available again
      get().updateCarAvailability(rental.carId, true);
      
      // Remove the rental
      set((state) => ({
        rentals: state.rentals.filter(r => r.id !== rentalId),
      }));
      
      get().calculateStats();
      get().saveData();
    }
  },

  updateCarLocation: (rentalId, location) => {
    set((state) => ({
      rentals: state.rentals.map((rental) =>
        rental.id === rentalId
          ? {
              ...rental,
              currentLocation: {
                ...location,
                timestamp: new Date().toISOString(),
              },
            }
          : rental
      ),
    }));
    get().saveData();
  },

  calculateStats: () => {
    const { cars, rentals } = get();
    const activeRentals = rentals.filter(r => r.status === 'active').length;
    const totalRevenue = rentals
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.totalPrice, 0);
    const availableCars = cars.filter(c => c.available).length;

    set({
      stats: {
        totalRentals: rentals.length,
        activeRentals,
        totalRevenue,
        availableCars,
      },
    });
  },

  loadData: async () => {
    try {
      const [carsData, customersData, rentalsData] = await Promise.all([
        AsyncStorage.getItem('cars'),
        AsyncStorage.getItem('customers'),
        AsyncStorage.getItem('rentals'),
      ]);

      const storedCars = carsData ? JSON.parse(carsData) : [];
      const allCars = [...VIP_CARS, ...storedCars];
      const uniqueCars = allCars.filter(
        (car, index, self) => index === self.findIndex((c) => c.id === car.id)
      );

      set({
        cars: uniqueCars,
        customers: customersData ? JSON.parse(customersData) : [],
        rentals: rentalsData ? JSON.parse(rentalsData) : [],
      });

      get().calculateStats();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  },

  saveData: async () => {
    try {
      const { cars, customers, rentals } = get();
      // Only save custom cars (not VIP_CARS)
      const customCars = cars.filter(car => !VIP_CARS.find(vipCar => vipCar.id === car.id));
      await Promise.all([
        AsyncStorage.setItem('cars', JSON.stringify(customCars)),
        AsyncStorage.setItem('customers', JSON.stringify(customers)),
        AsyncStorage.setItem('rentals', JSON.stringify(rentals)),
      ]);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  },
}));