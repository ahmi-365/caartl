import React from 'react';
import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';
import { StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

// Import Screens
import ListedVehiclesScreen from '../screens/ListedVehiclesScreen';
import { HomescreenLight } from '../screens/Caartl/homescreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import MyBiddingsScreen from '../screens/MyBiddingsScreen';
import FavoritesScreen from '../screens/FavoritesScreen'; // 🟢 Importing the updated screen

const Drawer = createDrawerNavigator();

// --- Placeholder Components ---
const PaymentsScreen = () => {
    const navigation = useNavigation();
    return (
        <View style={styles.placeholderContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Feather name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.placeholderTitle}>Payment Receipts</Text>
            <Text style={styles.placeholderSubtitle}>Coming Soon</Text>
        </View>
    );
};

// --- Custom Drawer Content ---
const CustomDrawerContent = (props: DrawerContentComponentProps) => {
    const { user, logout } = useAuth();

    const drawerItems = [
        { label: 'Home', icon: 'home', screen: 'ListedVehicles', type: 'Feather' },
        { label: 'My Bids', icon: 'gavel', screen: 'MyBiddings', type: 'MaterialCommunityIcons' },
        { label: 'Favorites', icon: 'heart', screen: 'Favorites', type: 'Feather' },
        { label: 'Payment Receipts', icon: 'file-text', screen: 'Payments', type: 'Feather' },
    ];

    return (
        <LinearGradient colors={['#000000', '#111111']} style={styles.drawerContainer}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.drawerHeader}>
                    <Image source={{ uri: 'https://static.codia.ai/image/2025-10-20/2s2Butmi2c.png' }} style={styles.drawerLogo} resizeMode="contain" />
                    <Text style={styles.welcomeText}>Hello, {user?.name || 'User'}</Text>
                </View>

                <View style={styles.drawerItemsContainer}>
                    {drawerItems.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.drawerItem} onPress={() => props.navigation.navigate(item.screen)}>
                            <View style={styles.iconBox}>
                                {item.type === 'MaterialCommunityIcons' ? (
                                    <MaterialCommunityIcons name={item.icon as any} size={18} color="#000" />
                                ) : (
                                    <Feather name={item.icon as any} size={18} color="#000" />
                                )}
                            </View>
                            <Text style={styles.drawerLabel}>{item.label}</Text>
                            <Feather name="chevron-right" size={18} color="#444" />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.drawerFooter}>
                    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                        <Text style={styles.logoutText}>Log Out</Text>
                        <MaterialCommunityIcons name="logout" size={18} color="#FF4444" />
                    </TouchableOpacity>
                    <Text style={styles.versionText}>App Version 1.0.0</Text>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};

// --- Drawer Navigator ---
export const DrawerNavigator = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerType: 'slide',
                overlayColor: 'rgba(0,0,0,0.8)',
                drawerStyle: { width: '80%', backgroundColor: '#000' },
            }}
            initialRouteName="ListedVehicles"
        >
            <Drawer.Screen name="ListedVehicles" component={ListedVehiclesScreen} />
            <Drawer.Screen name="Auctions" component={HomescreenLight} />
            <Drawer.Screen name="MyBookings" component={MyBookingsScreen} />
            <Drawer.Screen name="MyBiddings" component={MyBiddingsScreen} />
            <Drawer.Screen name="Favorites" component={FavoritesScreen} />
            <Drawer.Screen name="Payments" component={PaymentsScreen} />
        </Drawer.Navigator>
    );
};

const styles = StyleSheet.create({
    drawerContainer: { flex: 1, paddingHorizontal: 20 },
    drawerHeader: { marginTop: 20, marginBottom: 30, alignItems: 'flex-start' },
    drawerLogo: { width: 140, height: 60, marginBottom: 10 },
    welcomeText: { color: '#888', fontSize: 14, fontFamily: 'Poppins', marginLeft: 5 },
    drawerItemsContainer: { flex: 1 },
    drawerItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, padding: 12, borderWidth: 1, borderColor: '#222' },
    iconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#cadb2a', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    drawerLabel: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '500', fontFamily: 'Poppins' },
    drawerFooter: { paddingVertical: 30, borderTopWidth: 1, borderTopColor: '#222' },
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
    logoutText: { color: '#FF4444', fontSize: 16, fontFamily: 'Poppins', fontWeight: '600', marginRight: 10 },
    versionText: { color: '#444', fontSize: 12, fontFamily: 'Poppins', textAlign: 'center' },
    placeholderContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', position: 'relative' },
    placeholderTitle: { color: '#fff', fontSize: 20, fontFamily: 'Poppins' },
    placeholderSubtitle: { color: '#666', marginTop: 10 },
    backButton: { position: 'absolute', top: 60, left: 24, zIndex: 10, width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, justifyContent: 'center', alignItems: 'center' }
});