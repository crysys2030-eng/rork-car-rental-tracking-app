import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/auth-provider';
import { useLanguage } from '@/providers/language-provider';
import { Eye, EyeOff, Car } from 'lucide-react-native';
import LanguageSelector from '@/components/LanguageSelector';

export default function LoginScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  const { login, register } = useAuth();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (!success) {
        Alert.alert(t('error'), t('invalidCredentials'));
      }
    } catch (error) {
      Alert.alert(t('error'), t('loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !phone) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('error'), t('passwordsDoNotMatch'));
      return;
    }

    if (phone.length < 9) {
      Alert.alert(t('error'), t('pleaseEnterValidPhone'));
      return;
    }

    setIsLoading(true);
    try {
      const success = await register({
        name,
        email,
        phone,
        role: 'client',
      });
      if (!success) {
        Alert.alert(t('error'), t('registerError'));
      }
    } catch (error) {
      Alert.alert(t('error'), t('registerError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Car color="#FFD700" size={48} />
            <Text style={styles.logoText}>VIP Rentals</Text>
          </View>
          <LanguageSelector />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>
            {isRegisterMode ? t('registerTitle') : t('loginTitle')}
          </Text>
          <Text style={styles.subtitle}>
            {isRegisterMode ? t('registerSubtitle') : t('loginSubtitle')}
          </Text>

          {isRegisterMode && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('fullName')}</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder={t('fullName')}
                placeholderTextColor="#666"
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('email')}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={t('email')}
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {isRegisterMode && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('phone')}</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+351 9XX XXX XXX"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('password')}</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder={t('password')}
                placeholderTextColor="#666"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff color="#666" size={20} />
                ) : (
                  <Eye color="#666" size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {isRegisterMode && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('confirmPassword')}</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t('confirmPassword')}
                placeholderTextColor="#666"
                secureTextEntry={!showPassword}
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={isRegisterMode ? handleRegister : handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? t('loading') : (isRegisterMode ? t('register') : t('login'))}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={() => setIsRegisterMode(!isRegisterMode)}
          >
            <Text style={styles.switchModeText}>
              {isRegisterMode ? t('alreadyHaveAccount') : t('dontHaveAccount')}
            </Text>
            <Text style={styles.switchModeAction}>
              {isRegisterMode ? t('login') : t('createAccount')}
            </Text>
          </TouchableOpacity>

          <View style={styles.demoCredentials}>
            <Text style={styles.demoTitle}>{t('demoCredentials')}</Text>
            <Text style={styles.demoText}>{t('adminCredentials')}</Text>
            <Text style={styles.demoText}>{t('clientCredentials')}</Text>
            <Text style={styles.demoNote}>
              {isRegisterMode ? 'Após registar, use a palavra-passe: 123456' : 'Palavra-passe para todas as contas: 123456'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 12,
  },
  formContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B8B8B8',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E0E0E0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  eyeButton: {
    padding: 16,
  },
  submitButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  switchModeButton: {
    alignItems: 'center',
    marginTop: 24,
  },
  switchModeText: {
    fontSize: 14,
    color: '#B8B8B8',
    marginBottom: 4,
  },
  switchModeAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
  },
  demoCredentials: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
  },
  demoText: {
    fontSize: 12,
    color: '#B8B8B8',
    textAlign: 'center',
    marginBottom: 4,
  },
  demoNote: {
    fontSize: 11,
    color: '#FFD700',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});