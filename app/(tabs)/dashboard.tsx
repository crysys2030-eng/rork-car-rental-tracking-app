import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRentalStore } from '@/store/rental-store';
import { VIP_CARS } from '@/data/cars';
import { Car, TrendingUp, Users, DollarSign } from 'lucide-react-native';
import { useLanguage } from '@/providers/language-provider';
import { useAuth } from '@/providers/auth-provider';
import LanguageSelector from '@/components/LanguageSelector';
import { router } from 'expo-router';
import { LogOut, User } from 'lucide-react-native';

export default function DashboardScreen() {
  const { stats, cars, loadData } = useRentalStore();
  const { t } = useLanguage();
  const { user, logout, isAdmin } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const initializeData = async () => {
      await loadData();
      
      if (cars.length === 0) {
        const store = useRentalStore.getState();
        VIP_CARS.forEach(car => {
          if (car && car.id && car.brand && car.model) {
            store.addCar(car);
          }
        });
      }
    };

    initializeData();
  }, [cars.length, loadData]);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    subtitle 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string;
    subtitle?: string;
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Icon color={color} size={24} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <View style={styles.headerTop}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{t('dashboardTitle')}</Text>
            <Text style={styles.subtitle}>
              {isAdmin ? t('adminPanel') : t('clientArea')} - {user?.name}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <LanguageSelector />
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <LogOut color="#FFD700" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {isAdmin && (
        <View style={styles.statsGrid}>
          <StatCard
            title={t('totalRentals')}
            value={stats.totalRentals}
            icon={TrendingUp}
            color="#D4AF37"
          />
          <StatCard
            title={t('activeRentals')}
            value={stats.activeRentals}
            icon={Car}
            color="#4CAF50"
          />
          <StatCard
            title={t('totalRevenue')}
            value={`€${stats.totalRevenue.toLocaleString('pt-PT')}`}
            icon={DollarSign}
            color="#2196F3"
            subtitle={t('vatIncluded')}
          />
          <StatCard
            title={t('availableCars')}
            value={stats.availableCars}
            icon={Users}
            color="#FF9800"
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('fleetSummary')}</Text>
        <View style={styles.fleetSummary}>
          <Text style={styles.fleetText}>
            {cars.length} {t('fleetDescription')}
          </Text>
          <Text style={styles.fleetSubtext}>
            Ferrari • Lamborghini • Porsche • BMW • Mercedes-AMG • Audi
          </Text>
        </View>
      </View>

      {isAdmin && (
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/modal')}
        >
          <Text style={styles.actionButtonText}>{t('newBooking')}</Text>
        </TouchableOpacity>
      )}
      
      {!isAdmin && (
        <View style={styles.clientInfo}>
          <View style={styles.emergencyContact}>
            <Text style={styles.emergencyTitle}>{t('emergencyContact')}</Text>
            <Text style={styles.emergencyPhone}>{t('emergencyPhone')}</Text>
            <Text style={styles.emergencyDescription}>{t('serviceDescription')}</Text>
          </View>
        </View>
      )}
    </ScrollView>
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
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
    textShadowColor: 'rgba(212, 175, 55, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#B8B8B8',
  },
  statsGrid: {
    padding: 16,
    gap: 16,
  },
  statCard: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E0E0E0',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  section: {
    margin: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  fleetSummary: {
    alignItems: 'center',
  },
  fleetText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E0E0E0',
    marginBottom: 8,
  },
  fleetSubtext: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#FFD700',
    margin: 16,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  clientInfo: {
    margin: 16,
  },
  emergencyContact: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  emergencyPhone: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emergencyDescription: {
    fontSize: 14,
    color: '#B8B8B8',
    textAlign: 'center',
  },
});