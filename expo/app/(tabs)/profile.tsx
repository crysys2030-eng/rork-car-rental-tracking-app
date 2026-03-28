import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,

} from 'react-native';
import { Stack, router } from 'expo-router';
import { User, CreditCard, Shield, LogOut, Eye, EyeOff, Users, Car } from 'lucide-react-native';
import { useAuth } from '@/providers/auth-provider';
import { useLanguage } from '@/providers/language-provider';
import { PaymentInfo } from '@/types/car';
import LanguageSelector from '@/components/LanguageSelector';

export default function ProfileScreen() {
  const { user, updatePaymentInfo, logout } = useAuth();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showCardNumber, setShowCardNumber] = useState<boolean>(false);
  const [showCVV, setShowCVV] = useState<boolean>(false);
  const [paymentData, setPaymentData] = useState<PaymentInfo>({
    cardNumber: user?.paymentInfo?.cardNumber || '',
    cardHolderName: user?.paymentInfo?.cardHolderName || '',
    expiryDate: user?.paymentInfo?.expiryDate || '',
    cvv: user?.paymentInfo?.cvv || '',
    bankAccount: user?.paymentInfo?.bankAccount || '',
    iban: user?.paymentInfo?.iban || '',
  });

  const handleSavePaymentInfo = async () => {
    if (!paymentData.cardNumber || !paymentData.cardHolderName || !paymentData.expiryDate || !paymentData.cvv) {
      Alert.alert(t('error'), t('fillRequiredFields'));
      return;
    }

    const success = await updatePaymentInfo(paymentData);
    if (success) {
      Alert.alert(t('success'), t('profileUpdated'));
      setIsEditing(false);
    } else {
      Alert.alert(t('error'), t('profileUpdateError'));
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      'Tem a certeza que deseja sair?',
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('logout'), style: 'destructive', onPress: logout },
      ]
    );
  };

  const maskCardNumber = (cardNumber: string) => {
    if (!cardNumber) return '';
    if (showCardNumber) return cardNumber;
    return cardNumber.replace(/.(?=.{4})/g, '*');
  };

  const maskCVV = (cvv: string) => {
    if (!cvv) return '';
    if (showCVV) return cvv;
    return '*'.repeat(cvv.length);
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t('profileTitle'),
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#FFD700',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Personal Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User color="#FFD700" size={24} />
            <Text style={styles.sectionTitle}>{t('personalInfo')}</Text>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('fullName')}</Text>
              <Text style={styles.infoValue}>{user.name}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('email')}</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('phone')}</Text>
              <Text style={styles.infoValue}>{user.phone}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipo de Conta</Text>
              <Text style={[styles.infoValue, styles.roleText]}>
                {user.role === 'admin' ? t('admin') : t('client')}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard color="#FFD700" size={24} />
            <Text style={styles.sectionTitle}>{t('paymentInfo')}</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? t('cancel') : t('edit')}
              </Text>
            </TouchableOpacity>
          </View>
          
          {!user.paymentInfo && !isEditing ? (
            <View style={styles.noPaymentCard}>
              <Shield color="#FF6B6B" size={48} />
              <Text style={styles.noPaymentTitle}>{t('paymentRequired')}</Text>
              <Text style={styles.noPaymentDescription}>{t('paymentDescription')}</Text>
              <TouchableOpacity
                style={styles.addPaymentButton}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.addPaymentButtonText}>{t('addPaymentInfo')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.paymentCard}>
              {isEditing ? (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('cardNumber')} *</Text>
                    <TextInput
                      style={styles.input}
                      value={paymentData.cardNumber}
                      onChangeText={(text) => setPaymentData(prev => ({ ...prev, cardNumber: text }))}
                      placeholder="1234 5678 9012 3456"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      maxLength={19}
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('cardHolderName')} *</Text>
                    <TextInput
                      style={styles.input}
                      value={paymentData.cardHolderName}
                      onChangeText={(text) => setPaymentData(prev => ({ ...prev, cardHolderName: text }))}
                      placeholder="Nome do Titular"
                      placeholderTextColor="#666"
                    />
                  </View>
                  
                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                      <Text style={styles.inputLabel}>{t('expiryDate')} *</Text>
                      <TextInput
                        style={styles.input}
                        value={paymentData.expiryDate}
                        onChangeText={(text) => setPaymentData(prev => ({ ...prev, expiryDate: text }))}
                        placeholder="MM/AA"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                        maxLength={5}
                      />
                    </View>
                    
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>{t('cvv')} *</Text>
                      <TextInput
                        style={styles.input}
                        value={paymentData.cvv}
                        onChangeText={(text) => setPaymentData(prev => ({ ...prev, cvv: text }))}
                        placeholder="123"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                        maxLength={4}
                        secureTextEntry={!showCVV}
                      />
                    </View>
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('bankAccount')}</Text>
                    <TextInput
                      style={styles.input}
                      value={paymentData.bankAccount}
                      onChangeText={(text) => setPaymentData(prev => ({ ...prev, bankAccount: text }))}
                      placeholder="Número da Conta Bancária"
                      placeholderTextColor="#666"
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('iban')}</Text>
                    <TextInput
                      style={styles.input}
                      value={paymentData.iban}
                      onChangeText={(text) => setPaymentData(prev => ({ ...prev, iban: text }))}
                      placeholder="PT50 0000 0000 0000 0000 0000 0"
                      placeholderTextColor="#666"
                    />
                  </View>
                  
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSavePaymentInfo}
                  >
                    <Text style={styles.saveButtonText}>{t('updateProfile')}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.securityNotice}>
                    <Shield color="#4CAF50" size={20} />
                    <Text style={styles.securityText}>{t('paymentSecurity')}</Text>
                  </View>
                  
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>{t('cardNumber')}</Text>
                    <View style={styles.paymentValueContainer}>
                      <Text style={styles.paymentValue}>{maskCardNumber(user.paymentInfo?.cardNumber || '')}</Text>
                      <TouchableOpacity onPress={() => setShowCardNumber(!showCardNumber)}>
                        {showCardNumber ? <EyeOff color="#666" size={20} /> : <Eye color="#666" size={20} />}
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>{t('cardHolderName')}</Text>
                    <Text style={styles.paymentValue}>{user.paymentInfo?.cardHolderName}</Text>
                  </View>
                  
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>{t('expiryDate')}</Text>
                    <Text style={styles.paymentValue}>{user.paymentInfo?.expiryDate}</Text>
                  </View>
                  
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>{t('cvv')}</Text>
                    <View style={styles.paymentValueContainer}>
                      <Text style={styles.paymentValue}>{maskCVV(user.paymentInfo?.cvv || '')}</Text>
                      <TouchableOpacity onPress={() => setShowCVV(!showCVV)}>
                        {showCVV ? <EyeOff color="#666" size={20} /> : <Eye color="#666" size={20} />}
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {user.paymentInfo?.bankAccount && (
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>{t('bankAccount')}</Text>
                      <Text style={styles.paymentValue}>{user.paymentInfo.bankAccount}</Text>
                    </View>
                  )}
                  
                  {user.paymentInfo?.iban && (
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>{t('iban')}</Text>
                      <Text style={styles.paymentValue}>{user.paymentInfo.iban}</Text>
                    </View>
                  )}
                </>
              )}
            </View>
          )}
        </View>

        {/* Admin Options */}
        {user.role === 'admin' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Shield color="#FFD700" size={24} />
              <Text style={styles.sectionTitle}>Administração</Text>
            </View>
            
            <View style={styles.adminOptionsCard}>
              <TouchableOpacity
                style={styles.adminOption}
                onPress={() => router.push('/admin-users')}
              >
                <Users color="#FFD700" size={20} />
                <View style={styles.adminOptionContent}>
                  <Text style={styles.adminOptionTitle}>Gestão de Utilizadores</Text>
                  <Text style={styles.adminOptionDescription}>Criar, editar e gerir utilizadores</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.adminOption}
                onPress={() => router.push('/admin-rentals')}
              >
                <Car color="#FFD700" size={20} />
                <View style={styles.adminOptionContent}>
                  <Text style={styles.adminOptionTitle}>Alugueres Ativos</Text>
                  <Text style={styles.adminOptionDescription}>Ver carros alugados e contactos</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Language Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('language')}</Text>
          <LanguageSelector />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color="#FF6B6B" size={24} />
          <Text style={styles.logoutButtonText}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 10,
    flex: 1,
  },
  editButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFD700',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  infoLabel: {
    fontSize: 16,
    color: '#ccc',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  roleText: {
    color: '#FFD700',
  },
  noPaymentCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  noPaymentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginTop: 15,
    marginBottom: 10,
  },
  noPaymentDescription: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  addPaymentButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addPaymentButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  paymentCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d4f3c',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  securityText: {
    color: '#4CAF50',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  paymentLabel: {
    fontSize: 16,
    color: '#ccc',
    fontWeight: '500',
  },
  paymentValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginRight: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#555',
  },
  row: {
    flexDirection: 'row',
  },
  saveButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a1a1a',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  logoutButtonText: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  adminOptionsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  adminOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  adminOptionContent: {
    marginLeft: 15,
    flex: 1,
  },
  adminOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  adminOptionDescription: {
    fontSize: 14,
    color: '#ccc',
  },
});