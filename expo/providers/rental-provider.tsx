import createContextHook from '@nkzw/create-context-hook';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Car, Customer, Rental, RentalStats } from '@/types/car';

interface RentalState {
  cars: Car[];
  customers: Customer[];
  rentals: Rental[];
  stats: RentalStats;
  isLoading: boolean;
}

interface RentalActions {
  addCar: (car: Car) => void;
  updateCarAvailability: (carId: string, available: boolean) => void;
  addCustomer: (customer: Customer) => void;
  addRental: (rental: Rental) => void;
  updateRentalStatus: (rentalId: string, status: Rental['status']) => void;
  removeRental: (rentalId: string) => void;
  updateCarLocation: (rentalId: string, location: { latitude: number; longitude: number }) => void;
  loadData: () => Promise<void>;
}

export const [RentalProvider, useRentals] = createContextHook(() => {
  const [state, setState] = useState<RentalState>({
    cars: [],
    customers: [],
    rentals: [],
    stats: {
      totalRentals: 0,
      activeRentals: 0,
      totalRevenue: 0,
      availableCars: 0,
    },
    isLoading: true,
  });

  const calculateStats = (cars: Car[], rentals: Rental[]) => {
    const activeRentals = rentals.filter(r => r.status === 'active').length;
    const totalRevenue = rentals
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.totalPrice, 0);
    const availableCars = cars.filter(c => c.available).length;

    return {
      totalRentals: rentals.length,
      activeRentals,
      totalRevenue,
      availableCars,
    };
  };

  const saveData = async (cars: Car[], customers: Customer[], rentals: Rental[]) => {
    try {
      if (!Array.isArray(cars) || !Array.isArray(customers) || !Array.isArray(rentals)) {
        console.error('Invalid data format');
        return;
      }
      await Promise.all([
        AsyncStorage.setItem('cars', JSON.stringify(cars)),
        AsyncStorage.setItem('customers', JSON.stringify(customers)),
        AsyncStorage.setItem('rentals', JSON.stringify(rentals)),
      ]);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const loadData = async () => {
    try {
      const [carsData, customersData, rentalsData] = await Promise.all([
        AsyncStorage.getItem('cars'),
        AsyncStorage.getItem('customers'),
        AsyncStorage.getItem('rentals'),
      ]);

      const cars = carsData ? JSON.parse(carsData) : [];
      const customers = customersData ? JSON.parse(customersData) : [];
      const rentals = rentalsData ? JSON.parse(rentalsData) : [];

      setState(prev => ({
        ...prev,
        cars,
        customers,
        rentals,
        stats: calculateStats(cars, rentals),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const addCar = (car: Car) => {
    setState(prev => {
      const newCars = [...prev.cars, car];
      const newStats = calculateStats(newCars, prev.rentals);
      saveData(newCars, prev.customers, prev.rentals);
      return {
        ...prev,
        cars: newCars,
        stats: newStats,
      };
    });
  };

  const updateCarAvailability = (carId: string, available: boolean) => {
    setState(prev => {
      const newCars = prev.cars.map(car =>
        car.id === carId ? { ...car, available } : car
      );
      const newStats = calculateStats(newCars, prev.rentals);
      saveData(newCars, prev.customers, prev.rentals);
      return {
        ...prev,
        cars: newCars,
        stats: newStats,
      };
    });
  };

  const addCustomer = (customer: Customer) => {
    setState(prev => {
      const newCustomers = [...prev.customers, customer];
      saveData(prev.cars, newCustomers, prev.rentals);
      return {
        ...prev,
        customers: newCustomers,
      };
    });
  };

  const addRental = (rental: Rental) => {
    setState(prev => {
      const newRentals = [...prev.rentals, rental];
      const newCars = prev.cars.map(car =>
        car.id === rental.carId ? { ...car, available: false } : car
      );
      const newStats = calculateStats(newCars, newRentals);
      saveData(newCars, prev.customers, newRentals);
      return {
        ...prev,
        cars: newCars,
        rentals: newRentals,
        stats: newStats,
      };
    });
  };

  const updateRentalStatus = (rentalId: string, status: Rental['status']) => {
    setState(prev => {
      const newRentals = prev.rentals.map(rental =>
        rental.id === rentalId ? { ...rental, status } : rental
      );
      
      let newCars = prev.cars;
      if (status === 'completed' || status === 'cancelled') {
        const rental = newRentals.find(r => r.id === rentalId);
        if (rental) {
          newCars = prev.cars.map(car =>
            car.id === rental.carId ? { ...car, available: true } : car
          );
        }
      }
      
      const newStats = calculateStats(newCars, newRentals);
      saveData(newCars, prev.customers, newRentals);
      return {
        ...prev,
        cars: newCars,
        rentals: newRentals,
        stats: newStats,
      };
    });
  };

  const removeRental = (rentalId: string) => {
    setState(prev => {
      const rental = prev.rentals.find(r => r.id === rentalId);
      
      if (!rental) return prev;
      
      // Make the car available again
      const newCars = prev.cars.map(car =>
        car.id === rental.carId ? { ...car, available: true } : car
      );
      
      // Remove the rental
      const newRentals = prev.rentals.filter(r => r.id !== rentalId);
      
      const newStats = calculateStats(newCars, newRentals);
      saveData(newCars, prev.customers, newRentals);
      
      return {
        ...prev,
        cars: newCars,
        rentals: newRentals,
        stats: newStats,
      };
    });
  };

  const updateCarLocation = (rentalId: string, location: { latitude: number; longitude: number }) => {
    setState(prev => {
      const newRentals = prev.rentals.map(rental =>
        rental.id === rentalId
          ? {
              ...rental,
              currentLocation: {
                ...location,
                timestamp: new Date().toISOString(),
              },
            }
          : rental
      );
      saveData(prev.cars, prev.customers, newRentals);
      return {
        ...prev,
        rentals: newRentals,
      };
    });
  };

  const actions: RentalActions = {
    addCar,
    updateCarAvailability,
    addCustomer,
    addRental,
    updateRentalStatus,
    removeRental,
    updateCarLocation,
    loadData,
  };

  return {
    ...state,
    ...actions,
  };
});