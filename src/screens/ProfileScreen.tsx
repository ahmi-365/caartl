import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BottomNav } from '../components/BottomNavigation';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type ProfileScreenProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<ProfileScreenProp>();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const handleDeleteAccount = () => {
    setDeleteModalVisible(false);
    logout();
    Alert.alert("Account Deleted", "Your account has been successfully removed.");
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <LinearGradient
        colors={['rgba(202, 219, 42, 0)', 'rgba(202, 219, 42, 0.2)']}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View style={{ width: 24 }} />
            <Text style={styles.headerTitle}>Profile Setting</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Dynamic Profile Section */}
          <View>
            <View style={styles.profileSection}>
              <Image
                source={{ uri: user?.photo || 'https://i.pravatar.cc/150?img=12' }}
                style={styles.profileImage}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name || 'User Name'}</Text>
                <Text style={styles.profileEmail}>{user?.email || 'email@example.com'}</Text>
                <Text style={styles.profileRole}>{user?.role || 'Member'}</Text>
              </View>
              <TouchableOpacity
                style={styles.editIcon}
                onPress={() => navigation.navigate('EditProfile')} // 👈 Link to Edit
              >
                <Feather name="edit-2" size={20} color="#CADB2A" />
              </TouchableOpacity>
            </View>

            {/* 👈 Display Bio if exists */}
            {user?.bio ? (
              <View style={styles.bioContainer}>
                <Text style={styles.bioLabel}>Bio</Text>
                <Text style={styles.bioText}>{user.bio}</Text>
              </View>
            ) : null}

            <View style={styles.separatorLine} />
          </View>

          {/* Cards */}
          <View style={styles.cardContainer}>
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardIcon}><MaterialCommunityIcons name="card-account-details-outline" size={28} color="#CADB2A" /></View>
              <Text style={styles.cardLabel}>ID Card</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardIcon}><MaterialCommunityIcons name="card-account-details" size={28} color="#CADB2A" /></View>
              <Text style={styles.cardLabel}>License</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardIcon}><MaterialCommunityIcons name="file-document-outline" size={28} color="#CADB2A" /></View>
              <Text style={styles.cardLabel}>Contracts</Text>
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('ChangePassword')}
            >
              <View style={styles.menuIconContainer}>
                <Feather name="lock" size={24} color="#000" />
              </View>
              <Text style={styles.menuText}>Change Password</Text>
              <Feather name="arrow-right" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setDeleteModalVisible(true)}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#ff4444' }]}>
                <Feather name="trash-2" size={24} color="#fff" />
              </View>
              <Text style={[styles.menuText, { color: '#ff4444' }]}>Delete Account</Text>
              <Feather name="arrow-right" size={24} color="#ff4444" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={logout}>
              <View style={styles.menuIconContainer}>
                <MaterialCommunityIcons name="logout" size={24} color="#000" />
              </View>
              <Text style={styles.menuText}>Log Out</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Delete Confirmation Modal */}
        <Modal
          transparent={true}
          visible={deleteModalVisible}
          animationType="fade"
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.warningIcon}>
                <Feather name="alert-triangle" size={40} color="#ff4444" />
              </View>
              <Text style={styles.modalTitle}>Delete Account?</Text>
              <Text style={styles.modalText}>
                Are you sure you want to delete your account? This action cannot be undone.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={handleDeleteAccount}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <BottomNav />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1, paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 30 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#fff', fontFamily: 'Poppins' },

  profileSection: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  profileImage: { width: 60, height: 60, borderRadius: 15, marginRight: 15, borderWidth: 1, borderColor: '#cadb2a' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 2, fontFamily: 'Poppins' },
  profileEmail: { fontSize: 12, color: '#999', fontFamily: 'Poppins' },
  profileRole: { fontSize: 12, color: '#cadb2a', marginTop: 2, fontFamily: 'Poppins', textTransform: 'capitalize' },
  editIcon: { padding: 8, borderRadius: 15, backgroundColor: 'rgba(202, 219, 42, 0.2)', justifyContent: 'center', alignItems: 'center' },

  // Bio Styles
  bioContainer: { paddingHorizontal: 20, marginTop: 15 },
  bioLabel: { color: '#cadb2a', fontSize: 12, fontFamily: 'Poppins', fontWeight: '600', marginBottom: 4 },
  bioText: { color: '#ccc', fontSize: 13, fontFamily: 'Poppins', lineHeight: 20 },

  separatorLine: { height: 1, backgroundColor: '#CADB2A', marginHorizontal: 20, marginVertical: 20, opacity: 0.3 },

  cardContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 30 },
  card: { width: '30%', aspectRatio: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 15, borderWidth: 1, borderColor: '#CADB2A', justifyContent: 'center', alignItems: 'center', padding: 15 },
  cardIcon: { marginBottom: 10, width: 32, height: 32, borderRadius: 15, backgroundColor: 'rgba(202, 219, 42, 0.1)', justifyContent: 'center', alignItems: 'center' },
  cardLabel: { fontSize: 12, color: '#fff', fontWeight: '500', textAlign: 'center', fontFamily: 'Poppins' },

  menuContainer: { paddingHorizontal: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#222' },
  menuIconContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#CADB2A', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuText: { flex: 1, fontSize: 16, color: '#fff', fontWeight: '500', fontFamily: 'Poppins' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#111', borderRadius: 20, padding: 25, alignItems: 'center', borderWidth: 1, borderColor: '#ff4444' },
  warningIcon: { marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 10, fontFamily: 'Poppins' },
  modalText: { fontSize: 14, color: '#ccc', textAlign: 'center', marginBottom: 25, fontFamily: 'Poppins' },
  modalButtons: { flexDirection: 'row', gap: 15, width: '100%' },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  cancelButton: { backgroundColor: '#333' },
  deleteButton: { backgroundColor: '#ff4444' },
  buttonText: { color: '#fff', fontWeight: '600', fontFamily: 'Poppins' },
});