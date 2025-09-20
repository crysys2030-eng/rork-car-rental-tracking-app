import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { Camera, Upload, Save, X } from 'lucide-react-native';
import { useLanguage } from '@/providers/language-provider';
import { useAuth } from '@/providers/auth-provider';
import { useRentalStore } from '@/store/rental-store';
import { Car } from '@/types/car';

export default function AdminAddCarScreen() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const { addCar } = useRentalStore();
  
  const [carData, setCarData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    engine: '',
    horsepower: 0,
    pricePerDay: 0,
    pricePerHour: 0,
    image: '',
    interiorImage: '',
    description: '',
    vehicleType: 'coupe' as const,
    fuelType: 'gasoline' as const,
    transmission: 'automatic' as const,
    seats: 2,
    doors: 2,
    features: [] as string[],
    category: 'luxury' as const,
  });
  
  const [newFeature, setNewFeature] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAdmin) {
    router.replace('/(tabs)/cars');
    return null;
  }

  const handleAddFeature = () => {
    if (newFeature.trim() && !carData.features.includes(newFeature.trim())) {
      setCarData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setCarData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const handleImageUpload = (type: 'exterior' | 'interior') => {
    Alert.alert(
      t('addPhoto'),
      t('enterImageUrl'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('add'),
          onPress: () => {
            Alert.prompt(
              t('imageUrl'),
              t('enterValidImageUrl'),
              (url) => {
                if (url && url.trim()) {
                  if (type === 'exterior') {
                    setCarData(prev => ({ ...prev, image: url.trim() }));
                  } else {
                    setCarData(prev => ({ ...prev, interiorImage: url.trim() }));
                  }
                }
              },
              'plain-text',
              '',
              'url'
            );
          }
        }
      ]
    );
  };

  const handleSaveCar = async () => {
    if (!carData.brand || !carData.model || !carData.image || !carData.interiorImage) {
      Alert.alert(t('error'), t('fillAllRequiredFields'));
      return;
    }

    setIsLoading(true);
    try {
      const newCar: Car = {
        id: `car-${Date.now()}`,
        ...carData,
        available: true,
      };

      await addCar(newCar);
      Alert.alert(
        t('success'),
        t('carAddedSuccessfully'),
        [{ text: t('ok'), onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert(t('error'), t('errorAddingCar'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: t('addNewCar'),
          headerStyle: { backgroundColor: '#1976D2' },
          headerTintColor: '#fff',
        }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('basicInfo')}</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('brand')} *</Text>
            <TextInput
              style={styles.input}
              value={carData.brand}
              onChangeText={(text) => setCarData(prev => ({ ...prev, brand: text }))}
              placeholder={t('enterBrand')}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('model')} *</Text>
            <TextInput
              style={styles.input}
              value={carData.model}
              onChangeText={(text) => setCarData(prev => ({ ...prev, model: text }))}
              placeholder={t('enterModel')}
            />
          </View>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>{t('year')}</Text>
              <TextInput
                style={styles.input}
                value={carData.year.toString()}
                onChangeText={(text) => setCarData(prev => ({ ...prev, year: parseInt(text) || new Date().getFullYear() }))}
                keyboardType="numeric"
                placeholder="2024"
              />
            </View>
            
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>{t('horsepower')}</Text>
              <TextInput
                style={styles.input}
                value={carData.horsepower.toString()}
                onChangeText={(text) => setCarData(prev => ({ ...prev, horsepower: parseInt(text) || 0 }))}
                keyboardType="numeric"
                placeholder="500"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('engine')}</Text>
            <TextInput
              style={styles.input}
              value={carData.engine}
              onChangeText={(text) => setCarData(prev => ({ ...prev, engine: text }))}
              placeholder={t('enterEngine')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('pricing')}</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>{t('pricePerDay')} (€)</Text>
              <TextInput
                style={styles.input}
                value={carData.pricePerDay.toString()}
                onChangeText={(text) => setCarData(prev => ({ ...prev, pricePerDay: parseFloat(text) || 0 }))}
                keyboardType="numeric"
                placeholder="150"
              />
            </View>
            
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>{t('pricePerHour')} (€)</Text>
              <TextInput
                style={styles.input}
                value={carData.pricePerHour.toString()}
                onChangeText={(text) => setCarData(prev => ({ ...prev, pricePerHour: parseFloat(text) || 0 }))}
                keyboardType="numeric"
                placeholder="25"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('photos')}</Text>
          
          <View style={styles.photoSection}>
            <Text style={styles.label}>{t('exteriorPhoto')} *</Text>
            {carData.image ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: carData.image }} style={styles.previewImage} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setCarData(prev => ({ ...prev, image: '' }))}
                >
                  <X size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={() => handleImageUpload('exterior')}
              >
                <Upload size={24} color="#1976D2" />
                <Text style={styles.uploadText}>{t('addExteriorPhoto')}</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.photoSection}>
            <Text style={styles.label}>{t('interiorPhoto')} *</Text>
            {carData.interiorImage ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: carData.interiorImage }} style={styles.previewImage} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setCarData(prev => ({ ...prev, interiorImage: '' }))}
                >
                  <X size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={() => handleImageUpload('interior')}
              >
                <Upload size={24} color="#1976D2" />
                <Text style={styles.uploadText}>{t('addInteriorPhoto')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('description')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={carData.description}
            onChangeText={(text) => setCarData(prev => ({ ...prev, description: text }))}
            placeholder={t('enterDescription')}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('features')}</Text>
          
          <View style={styles.featureInput}>
            <TextInput
              style={[styles.input, styles.featureTextInput]}
              value={newFeature}
              onChangeText={setNewFeature}
              placeholder={t('addFeature')}
            />
            <TouchableOpacity style={styles.addFeatureButton} onPress={handleAddFeature}>
              <Text style={styles.addFeatureText}>+</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.featuresContainer}>
            {carData.features.map((feature, index) => (
              <View key={index} style={styles.featureTag}>
                <Text style={styles.featureText}>{feature}</Text>
                <TouchableOpacity onPress={() => handleRemoveFeature(feature)}>
                  <X size={14} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSaveCar}
          disabled={isLoading}
        >
          <Save size={20} color="#fff" />
          <Text style={styles.saveButtonText}>
            {isLoading ? t('saving') : t('saveCar')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  photoSection: {
    marginBottom: 20,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#1976D2',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  uploadText: {
    marginTop: 8,
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  featureInput: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  featureTextInput: {
    flex: 1,
    marginRight: 8,
    marginBottom: 0,
  },
  addFeatureButton: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
    width: 40,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFeatureText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureTag: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    color: '#1976D2',
    fontSize: 12,
    marginRight: 6,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});