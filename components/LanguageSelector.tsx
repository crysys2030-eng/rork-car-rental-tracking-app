import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { X, Globe } from 'lucide-react-native';
import { SUPPORTED_LANGUAGES } from '@/constants/languages';
import { useLanguage } from '@/providers/language-provider';

interface LanguageSelectorProps {
  showButton?: boolean;
}

export default function LanguageSelector({ showButton = true }: LanguageSelectorProps) {
  const { currentLanguage, setLanguage, t } = useLanguage();
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleLanguageSelect = async (languageCode: string) => {
    await setLanguage(languageCode as any);
    setShowModal(false);
  };

  const renderLanguageItem = ({ item }: { item: typeof SUPPORTED_LANGUAGES[number] }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        currentLanguage === item.code && styles.languageItemSelected
      ]}
      onPress={() => handleLanguageSelect(item.code)}
      testID={`language-${item.code}`}
    >
      <Text style={styles.flag}>{item.flag}</Text>
      <Text style={[
        styles.languageName,
        currentLanguage === item.code && styles.languageNameSelected
      ]}>
        {item.name}
      </Text>
      {currentLanguage === item.code && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (!showButton) {
    return (
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <X color="#666" size={24} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={SUPPORTED_LANGUAGES}
            renderItem={renderLanguageItem}
            keyExtractor={(item) => item.code}
            contentContainerStyle={styles.languageList}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => setShowModal(true)}
        testID="language-selector-button"
      >
        <Globe color="#FFD700" size={20} />
        <Text style={styles.languageButtonText}>
          {SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage)?.flag}
        </Text>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <X color="#666" size={24} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={SUPPORTED_LANGUAGES}
            renderItem={renderLanguageItem}
            keyExtractor={(item) => item.code}
            contentContainerStyle={styles.languageList}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  languageButtonText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#1a1a1a',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  languageList: {
    padding: 20,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  languageItemSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageName: {
    fontSize: 18,
    color: '#fff',
    flex: 1,
  },
  languageNameSelected: {
    color: '#000',
    fontWeight: '600',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
});