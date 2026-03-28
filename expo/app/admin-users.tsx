import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Users, Plus, Edit3, Trash2, Search, UserCheck, UserX } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/car';
import { useAuth } from '@/providers/auth-provider';

interface UserWithStatus extends User {
  isActive: boolean;
}

export default function AdminUsersScreen() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserWithStatus[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithStatus[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserWithStatus | null>(null);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [newUser, setNewUser] = useState<{
    name: string;
    email: string;
    phone: string;
    role: 'admin' | 'client';
    isActive: boolean;
  }>({
    name: '',
    email: '',
    phone: '',
    role: 'client',
    isActive: true,
  });

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      router.back();
      return;
    }
    loadUsers();
  }, [currentUser]);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, filterActive]);

  const loadUsers = async () => {
    try {
      // Load demo users
      const demoUsers: UserWithStatus[] = [
        {
          id: 'admin-1',
          name: 'Administrador VIP',
          email: 'admin@viprentals.pt',
          phone: '+351 912 345 678',
          role: 'admin',
          createdAt: new Date().toISOString(),
          isActive: true,
        },
        {
          id: 'client-1',
          name: 'João Silva',
          email: 'joao@example.pt',
          phone: '+351 963 789 012',
          role: 'client',
          createdAt: new Date().toISOString(),
          isActive: true,
        },
      ];

      // Load registered users
      const registeredUsersData = await AsyncStorage.getItem('registered_users');
      const registeredUsers: User[] = registeredUsersData ? JSON.parse(registeredUsersData) : [];
      
      // Load user status data
      const userStatusData = await AsyncStorage.getItem('user_status');
      const userStatus: Record<string, boolean> = userStatusData ? JSON.parse(userStatusData) : {};

      const registeredUsersWithStatus: UserWithStatus[] = registeredUsers.map(user => ({
        ...user,
        isActive: userStatus[user.id] !== false, // Default to active if not specified
      }));

      const allUsers = [...demoUsers, ...registeredUsersWithStatus];
      setUsers(allUsers);
    } catch (error) {
      console.log('Error loading users:', error);
      Alert.alert('Erro', 'Erro ao carregar utilizadores');
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery)
      );
    }

    // Filter by active status
    if (filterActive !== 'all') {
      filtered = filtered.filter(user => 
        filterActive === 'active' ? user.isActive : !user.isActive
      );
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.phone) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    // Check if email already exists
    const emailExists = users.some(user => user.email === newUser.email);
    if (emailExists) {
      Alert.alert('Erro', 'Já existe um utilizador com este email');
      return;
    }

    try {
      const user: UserWithStatus = {
        id: `user-${Date.now()}`,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        createdAt: new Date().toISOString(),
        isActive: newUser.isActive,
      };

      // Save to registered users
      const registeredUsersData = await AsyncStorage.getItem('registered_users');
      const registeredUsers: User[] = registeredUsersData ? JSON.parse(registeredUsersData) : [];
      registeredUsers.push(user);
      await AsyncStorage.setItem('registered_users', JSON.stringify(registeredUsers));

      // Save user status
      const userStatusData = await AsyncStorage.getItem('user_status');
      const userStatus: Record<string, boolean> = userStatusData ? JSON.parse(userStatusData) : {};
      userStatus[user.id] = user.isActive;
      await AsyncStorage.setItem('user_status', JSON.stringify(userStatus));

      setUsers(prev => [...prev, user]);
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', phone: '', role: 'client', isActive: true });
      Alert.alert('Sucesso', 'Utilizador criado com sucesso');
    } catch (error) {
      console.log('Error creating user:', error);
      Alert.alert('Erro', 'Erro ao criar utilizador');
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      // Update in registered users if it's not a demo user
      if (!selectedUser.id.startsWith('admin-') && !selectedUser.id.startsWith('client-')) {
        const registeredUsersData = await AsyncStorage.getItem('registered_users');
        const registeredUsers: User[] = registeredUsersData ? JSON.parse(registeredUsersData) : [];
        const userIndex = registeredUsers.findIndex(u => u.id === selectedUser.id);
        if (userIndex !== -1) {
          registeredUsers[userIndex] = { ...selectedUser };
          await AsyncStorage.setItem('registered_users', JSON.stringify(registeredUsers));
        }
      }

      // Update user status
      const userStatusData = await AsyncStorage.getItem('user_status');
      const userStatus: Record<string, boolean> = userStatusData ? JSON.parse(userStatusData) : {};
      userStatus[selectedUser.id] = selectedUser.isActive;
      await AsyncStorage.setItem('user_status', JSON.stringify(userStatus));

      setUsers(prev => prev.map(u => u.id === selectedUser.id ? selectedUser : u));
      setShowEditModal(false);
      setSelectedUser(null);
      Alert.alert('Sucesso', 'Utilizador atualizado com sucesso');
    } catch (error) {
      console.log('Error updating user:', error);
      Alert.alert('Erro', 'Erro ao atualizar utilizador');
    }
  };

  const handleDeleteUser = (user: UserWithStatus) => {
    if (user.id === currentUser?.id) {
      Alert.alert('Erro', 'Não pode eliminar a sua própria conta');
      return;
    }

    if (user.id.startsWith('admin-') || user.id.startsWith('client-')) {
      Alert.alert('Erro', 'Não pode eliminar utilizadores de demonstração');
      return;
    }

    Alert.alert(
      'Confirmar Eliminação',
      `Tem a certeza que deseja eliminar o utilizador ${user.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove from registered users
              const registeredUsersData = await AsyncStorage.getItem('registered_users');
              const registeredUsers: User[] = registeredUsersData ? JSON.parse(registeredUsersData) : [];
              const filteredUsers = registeredUsers.filter(u => u.id !== user.id);
              await AsyncStorage.setItem('registered_users', JSON.stringify(filteredUsers));

              // Remove from user status
              const userStatusData = await AsyncStorage.getItem('user_status');
              const userStatus: Record<string, boolean> = userStatusData ? JSON.parse(userStatusData) : {};
              delete userStatus[user.id];
              await AsyncStorage.setItem('user_status', JSON.stringify(userStatus));

              setUsers(prev => prev.filter(u => u.id !== user.id));
              Alert.alert('Sucesso', 'Utilizador eliminado com sucesso');
            } catch (error) {
              console.log('Error deleting user:', error);
              Alert.alert('Erro', 'Erro ao eliminar utilizador');
            }
          },
        },
      ]
    );
  };

  const toggleUserStatus = async (user: UserWithStatus) => {
    const updatedUser = { ...user, isActive: !user.isActive };
    
    try {
      // Update user status
      const userStatusData = await AsyncStorage.getItem('user_status');
      const userStatus: Record<string, boolean> = userStatusData ? JSON.parse(userStatusData) : {};
      userStatus[user.id] = updatedUser.isActive;
      await AsyncStorage.setItem('user_status', JSON.stringify(userStatus));

      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    } catch (error) {
      console.log('Error toggling user status:', error);
      Alert.alert('Erro', 'Erro ao alterar estado do utilizador');
    }
  };

  const renderUserCard = (user: UserWithStatus) => (
    <View key={user.id} style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userPhone}>{user.phone}</Text>
        </View>
        <View style={styles.userActions}>
          <View style={[styles.roleTag, user.role === 'admin' ? styles.adminTag : styles.clientTag]}>
            <Text style={styles.roleText}>{user.role === 'admin' ? 'Admin' : 'Cliente'}</Text>
          </View>
          <View style={[styles.statusTag, user.isActive ? styles.activeTag : styles.inactiveTag]}>
            {user.isActive ? <UserCheck color="#4CAF50" size={16} /> : <UserX color="#FF6B6B" size={16} />}
            <Text style={[styles.statusText, user.isActive ? styles.activeText : styles.inactiveText]}>
              {user.isActive ? 'Ativo' : 'Inativo'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.userFooter}>
        <TouchableOpacity
          style={[styles.actionButton, styles.statusButton]}
          onPress={() => toggleUserStatus(user)}
        >
          <Text style={styles.actionButtonText}>
            {user.isActive ? 'Desativar' : 'Ativar'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {
            setSelectedUser(user);
            setShowEditModal(true);
          }}
        >
          <Edit3 color="#FFD700" size={16} />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        
        {!user.id.startsWith('admin-') && !user.id.startsWith('client-') && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteUser(user)}
          >
            <Trash2 color="#FF6B6B" size={16} />
            <Text style={styles.actionButtonText}>Eliminar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Gestão de Utilizadores',
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#FFD700',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      
      {/* Header with stats */}
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{users.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{users.filter(u => u.isActive).length}</Text>
            <Text style={styles.statLabel}>Ativos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{users.filter(u => !u.isActive).length}</Text>
            <Text style={styles.statLabel}>Inativos</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus color="#000" size={20} />
          <Text style={styles.createButtonText}>Criar Utilizador</Text>
        </TouchableOpacity>
      </View>

      {/* Search and filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search color="#666" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar utilizadores..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.filterContainer}>
          {(['all', 'active', 'inactive'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterButton, filterActive === filter && styles.activeFilter]}
              onPress={() => setFilterActive(filter)}
            >
              <Text style={[styles.filterText, filterActive === filter && styles.activeFilterText]}>
                {filter === 'all' ? 'Todos' : filter === 'active' ? 'Ativos' : 'Inativos'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Users list */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredUsers.map(renderUserCard)}
      </ScrollView>

      {/* Create User Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Criar Novo Utilizador</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Nome completo"
              placeholderTextColor="#666"
              value={newUser.name}
              onChangeText={(text) => setNewUser(prev => ({ ...prev, name: text }))}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Email"
              placeholderTextColor="#666"
              value={newUser.email}
              onChangeText={(text) => setNewUser(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Telefone"
              placeholderTextColor="#666"
              value={newUser.phone}
              onChangeText={(text) => setNewUser(prev => ({ ...prev, phone: text }))}
              keyboardType="phone-pad"
            />
            
            <View style={styles.roleSelector}>
              <Text style={styles.roleSelectorLabel}>Tipo de Conta:</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[styles.roleButton, newUser.role === 'client' && styles.selectedRole]}
                  onPress={() => setNewUser(prev => ({ ...prev, role: 'client' }))}
                >
                  <Text style={[styles.roleButtonText, newUser.role === 'client' && styles.selectedRoleText]}>Cliente</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleButton, newUser.role === 'admin' && styles.selectedRole]}
                  onPress={() => setNewUser(prev => ({ ...prev, role: 'admin' }))}
                >
                  <Text style={[styles.roleButtonText, newUser.role === 'admin' && styles.selectedRoleText]}>Admin</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Conta Ativa:</Text>
              <Switch
                value={newUser.isActive}
                onValueChange={(value) => setNewUser(prev => ({ ...prev, isActive: value }))}
                trackColor={{ false: '#333', true: '#FFD700' }}
                thumbColor={newUser.isActive ? '#000' : '#666'}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewUser({ name: '', email: '', phone: '', role: 'client', isActive: true });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleCreateUser}
              >
                <Text style={styles.saveButtonText}>Criar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit User Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Utilizador</Text>
            
            {selectedUser && (
              <>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Nome completo"
                  placeholderTextColor="#666"
                  value={selectedUser.name}
                  onChangeText={(text) => setSelectedUser(prev => prev ? { ...prev, name: text } : null)}
                />
                
                <TextInput
                  style={styles.modalInput}
                  placeholder="Email"
                  placeholderTextColor="#666"
                  value={selectedUser.email}
                  onChangeText={(text) => setSelectedUser(prev => prev ? { ...prev, email: text } : null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                
                <TextInput
                  style={styles.modalInput}
                  placeholder="Telefone"
                  placeholderTextColor="#666"
                  value={selectedUser.phone}
                  onChangeText={(text) => setSelectedUser(prev => prev ? { ...prev, phone: text } : null)}
                  keyboardType="phone-pad"
                />
                
                <View style={styles.roleSelector}>
                  <Text style={styles.roleSelectorLabel}>Tipo de Conta:</Text>
                  <View style={styles.roleButtons}>
                    <TouchableOpacity
                      style={[styles.roleButton, selectedUser.role === 'client' && styles.selectedRole]}
                      onPress={() => setSelectedUser(prev => prev ? { ...prev, role: 'client' } : null)}
                    >
                      <Text style={[styles.roleButtonText, selectedUser.role === 'client' && styles.selectedRoleText]}>Cliente</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.roleButton, selectedUser.role === 'admin' && styles.selectedRole]}
                      onPress={() => setSelectedUser(prev => prev ? { ...prev, role: 'admin' } : null)}
                    >
                      <Text style={[styles.roleButtonText, selectedUser.role === 'admin' && styles.selectedRoleText]}>Admin</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Conta Ativa:</Text>
                  <Switch
                    value={selectedUser.isActive}
                    onValueChange={(value) => setSelectedUser(prev => prev ? { ...prev, isActive: value } : null)}
                    trackColor={{ false: '#333', true: '#FFD700' }}
                    thumbColor={selectedUser.isActive ? '#000' : '#666'}
                  />
                </View>
              </>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleEditUser}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  statLabel: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 5,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#000',
    fontWeight: 'bold',
    marginLeft: 8,
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  activeFilter: {
    backgroundColor: '#FFD700',
  },
  filterText: {
    color: '#ccc',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#000',
  },
  scrollView: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  userCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 3,
  },
  userPhone: {
    fontSize: 14,
    color: '#ccc',
  },
  userActions: {
    alignItems: 'flex-end',
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  adminTag: {
    backgroundColor: '#FF6B6B',
  },
  clientTag: {
    backgroundColor: '#4CAF50',
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeTag: {
    backgroundColor: '#0d4f3c',
  },
  inactiveTag: {
    backgroundColor: '#4f0d0d',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  activeText: {
    color: '#4CAF50',
  },
  inactiveText: {
    color: '#FF6B6B',
  },
  userFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center',
  },
  statusButton: {
    backgroundColor: '#333',
  },
  editButton: {
    backgroundColor: '#333',
  },
  deleteButton: {
    backgroundColor: '#333',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#555',
  },
  roleSelector: {
    marginBottom: 15,
  },
  roleSelectorLabel: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '600',
    marginBottom: 10,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#333',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedRole: {
    backgroundColor: '#FFD700',
  },
  roleButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  selectedRoleText: {
    color: '#000',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  saveButton: {
    backgroundColor: '#FFD700',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});