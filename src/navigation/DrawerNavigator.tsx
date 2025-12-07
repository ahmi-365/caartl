import React from 'react';
import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';
import { StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

// Import ONLY Home screen here
import { HomescreenLight } from '../screens/Caartl/homescreen';

const Drawer = createDrawerNavigator();

// --- 1. Define Placeholder Components Outside ---
const MyBookingsScreen = () => (
    <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderTitle}>My Bookings</Text>
        <Text style={styles.placeholderSubtitle}>Coming Soon</Text>
    </View>
);

const PaymentsScreen = () => (
    <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderTitle}>Payment Receipts</Text>
        <Text style={styles.placeholderSubtitle}>Coming Soon</Text>
    </View>
);

const NegotiationsScreen = () => (
    <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderTitle}>Negotiations</Text>
        <Text style={styles.placeholderSubtitle}>Coming Soon</Text>
    </View>
);

// --- 2. Custom Drawer Content ---
const CustomDrawerContent = (props: DrawerContentComponentProps) => {
    const { user, logout } = useAuth();

    // 1. Only keep "extra" items in the drawer menu
    // 2. Fixed Icons: 'car' is not in Feather, using 'truck' or switching library.
    //    Let's stick to Feather for consistency where possible, or use conditional rendering.
    const drawerItems = [
        { label: 'My Bookings', icon: 'bookmark', screen: 'MyBookings' }, // Changed 'car' to 'bookmark'
        { label: 'Payment Receipts', icon: 'file-text', screen: 'Payments' },
        { label: 'Negotiations', icon: 'briefcase', screen: 'Negotiations' },
    ];

    return (
        <LinearGradient
            colors={['#000000', '#111111']}
            style={styles.drawerContainer}
        >
            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.drawerHeader}>
                    <Image
                        source={{ uri: 'https://static.codia.ai/image/2025-10-20/2s2Butmi2c.png' }}
                        style={styles.drawerLogo}
                        resizeMode="contain"
                    />
                    <Text style={styles.welcomeText}>Hello, {user?.name || 'User'}</Text>
                </View>

                {/* Menu Items */}
                <View style={styles.drawerItemsContainer}>
                    {drawerItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.drawerItem}
                            onPress={() => props.navigation.navigate(item.screen)}
                        >
                            <View style={styles.iconBox}>
                                <Feather name={item.icon as any} size={18} color="#000" />
                            </View>
                            <Text style={styles.drawerLabel}>{item.label}</Text>
                            <Feather name="chevron-right" size={18} color="#444" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Footer */}
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

// --- 3. Drawer Navigator ---
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
        >
            {/* The Drawer WRAPS the Home Screen only */}
            <Drawer.Screen name="HomeTab" component={HomescreenLight} />

            {/* Drawer-only screens - Now passing components directly, not inline functions */}
            <Drawer.Screen name="MyBookings" component={MyBookingsScreen} />
            <Drawer.Screen name="Payments" component={PaymentsScreen} />
            <Drawer.Screen name="Negotiations" component={NegotiationsScreen} />
        </Drawer.Navigator>
    );
};

const styles = StyleSheet.create({
    drawerContainer: { flex: 1, paddingHorizontal: 20 },
    drawerHeader: { marginTop: 40, marginBottom: 30, alignItems: 'flex-start' },
    drawerLogo: { width: 140, height: 60, marginBottom: 10 },
    welcomeText: { color: '#888', fontSize: 14, fontFamily: 'Poppins', marginLeft: 5 },

    drawerItemsContainer: { flex: 1 },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 15,
        padding: 12,
        borderWidth: 1,
        borderColor: '#222'
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#cadb2a',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    drawerLabel: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
        fontFamily: 'Poppins',
    },

    drawerFooter: { paddingVertical: 30, borderTopWidth: 1, borderTopColor: '#222' },
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
    logoutText: { color: '#FF4444', fontSize: 16, fontFamily: 'Poppins', fontWeight: '600', marginRight: 10 },
    versionText: { color: '#444', fontSize: 12, fontFamily: 'Poppins', textAlign: 'center' },

    // Placeholder Screen Styles
    placeholderContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    placeholderTitle: { color: '#fff', fontSize: 20, fontFamily: 'Poppins' },
    placeholderSubtitle: { color: '#666', marginTop: 10 },
});