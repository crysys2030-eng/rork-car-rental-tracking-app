export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  engine: string;
  horsepower: number;
  pricePerDay: number; // com IVA incluído
  pricePerHour: number; // com IVA incluído
  image: string;
  interiorImage: string;
  available: boolean;
  features: string[];
  category: 'supercar' | 'luxury' | 'sport';
  description: string;
  vehicleType: 'coupe' | 'convertible' | 'sedan' | 'suv' | 'hatchback';
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  transmission: 'manual' | 'automatic' | 'semi-automatic';
  seats: number;
  doors: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
}

export interface Rental {
  id: string;
  carId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  rentalType: 'hours' | 'days';
  duration: number; // hours or days
  totalPrice: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  trackingEnabled: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
    address?: string;
  };
  createdAt: string;
}

export interface RentalStats {
  totalRentals: number;
  activeRentals: number;
  totalRevenue: number;
  availableCars: number;
}

export interface PaymentInfo {
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  cvv: string;
  bankAccount?: string;
  iban?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'client';
  createdAt: string;
  paymentInfo?: PaymentInfo;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}