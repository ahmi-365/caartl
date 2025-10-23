import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomNav } from '../components/BottomNavigation';

export default function ProfileScreen() {
  return (
    <LinearGradient
      colors={['rgba(202, 219, 42, 0)', 'rgba(202, 219, 42, 0.46)']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Setting</Text>
        </View>

        {/* Profile Section */}
        <View>
          <View style={styles.profileSection}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Mike John</Text>
              <Text style={styles.editProfile}>edit Profile</Text>
            </View>
            <TouchableOpacity style={styles.editIcon}>
              <Feather name="edit-2" size={20} color="#CADB2A" />
            </TouchableOpacity>
          </View>

          {/* 👇 This is the straight line below */}
          <View style={styles.separatorLine} />
        </View>

        {/* Card Options */}
        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardIcon}>
              <MaterialCommunityIcons name="card-account-details-outline" size={28} color="#CADB2A" />
            </View>
            <Text style={styles.cardLabel}>ID Card</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <View style={styles.cardIcon}>
              <MaterialCommunityIcons name="card-account-details" size={28} color="#CADB2A" />
            </View>
            <Text style={styles.cardLabel}>License</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <View style={styles.cardIcon}>
              <MaterialCommunityIcons name="file-document-outline" size={28} color="#CADB2A" />
            </View>
            <Text style={styles.cardLabel}>Contracts</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <MaterialCommunityIcons name="car" size={24} color="#000" />
            </View>
            <Text style={styles.menuText}>My Bookings</Text>
            <Feather name="arrow-right" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <MaterialCommunityIcons name="account-details" size={24} color="#000" />
            </View>
            <Text style={styles.menuText}>Payment Receipts</Text>
            <Feather name="arrow-right" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <MaterialCommunityIcons name="car-arrow-right" size={24} color="#000" />
            </View>
            <Text style={styles.menuText}>Negotiations</Text>
            <Feather name="arrow-right" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Feather name="settings" size={24} color="#000" />
            </View>
            <Text style={styles.menuText}>Preferences</Text>
            <Feather name="arrow-right" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <MaterialCommunityIcons name="account" size={24} color="#fff" />
            </View>
            <Text style={styles.menuText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomNav />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
    paddingTop: 50,
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#CADB2A',
    marginHorizontal: 20,
    marginVertical: 10,
    opacity: 0.4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 15, // 👈 Changed to 15px
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  editProfile: {
    fontSize: 14,
    color: '#999',
  },
  editIcon: {
    padding: 8,
    borderRadius: 15, // 👈 Added 15px border radius
    backgroundColor: 'rgba(202, 219, 42, 0.2)', // 👈 Added subtle background
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  card: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15, // 👈 Changed to 15px
    borderWidth: 1,
    borderColor: '#CADB2A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  cardIcon: {
    marginBottom: 10,
    width: 32, // 👈 Fixed size for consistency
    height: 32,
    borderRadius: 15, // 👈 Added 15px border radius
    backgroundColor: 'rgba(202, 219, 42, 0.1)', // 👈 Subtle background
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 15, // 👈 Changed to 15px (was 24)
    backgroundColor: '#CADB2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});