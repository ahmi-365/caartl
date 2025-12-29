import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect, DrawerActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import apiService from '../services/ApiService';
import { useAlert } from '../context/AlertContext';
import { RootStackParamList } from '../navigation/AppNavigator';

// Navigation Components
import { TopBar } from '../components/TopBar';
import { BottomNav } from '../components/BottomNavigation';

const { width } = Dimensions.get('window');

// ... (Keep Booking Interface and formatDate helper same as before) ...
interface Booking {
    id: number;
    total_amount: string;
    status: string;
    created_at: string;
    vehicle: {
        id: number;
        title: string;
        year: number;
        mileage: number;
        cover_image?: any;
        images?: any[];
        brand?: { name: string; image_source: string };
        vehicle_model?: { name: string };
        register_emirates?: string;
    };
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export default function MyBookingsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();
    const { showAlert } = useAlert();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBookings = async () => {
        try {
            const result = await apiService.apiCall<any>('/get-bookings');
            if (result.success && result.data?.data?.data) {
                setBookings(result.data.data.data);
            } else {
                setBookings([]);
            }
        } catch (error) {
            console.error(error);
            showAlert('Error', 'Failed to fetch bookings.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBookings();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    // ... (Keep getImageUrl, getStatusColor, getStatusLabel, renderItem same as before) ...
    const getImageUrl = (vehicle: any) => {
        if (!vehicle) return 'https://via.placeholder.com/300x200';
        if (vehicle.cover_image) {
            if (typeof vehicle.cover_image === 'string') return vehicle.cover_image;
            if (typeof vehicle.cover_image === 'object' && vehicle.cover_image.path) return vehicle.cover_image.path;
        }
        if (vehicle.images && Array.isArray(vehicle.images) && vehicle.images.length > 0) return vehicle.images[0].path;
        if (vehicle.brand && vehicle.brand.image_source) return vehicle.brand.image_source;
        return 'https://c.animaapp.com/mg9397aqkN2Sch/img/tesla.png';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending_payment': return '#ffaa00';
            case 'intransfer': return '#00a8ff';
            case 'completed': return '#cadb2a';
            case 'cancelled': return '#ff4444';
            default: return '#888';
        }
    };

    const getStatusLabel = (status: string) => {
        return status ? status.replace('_', ' ').toUpperCase() : 'UNKNOWN';
    };

    // 🟢 FIX: Correctly Dispatch Open Drawer Action
    const handleMenuPress = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    const handleNotificationPress = () => { };

    const renderItem = ({ item }: { item: Booking }) => {
        const vehicle = item.vehicle;
        if (!vehicle) return null;
        const brandName = vehicle.brand?.name || '';
        const modelName = vehicle.vehicle_model?.name || '';
        const title = vehicle.title || `${brandName} ${modelName}`;

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                style={styles.card}
                onPress={() => navigation.navigate('LiveAuction', {
                    carId: vehicle.id,
                    viewType: 'negotiation'
                })}
            >
                <View style={styles.cardInner}>
                    <Image source={{ uri: getImageUrl(vehicle) }} style={styles.image} resizeMode="cover" />
                    <View style={styles.infoContainer}>
                        <View style={styles.headerRow}>
                            <Text style={styles.title} numberOfLines={1}>{title}</Text>
                            <View style={[styles.statusBadge, { borderColor: getStatusColor(item.status) }]}>
                                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                                    {getStatusLabel(item.status)}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.subText}>{vehicle.year} | {vehicle.mileage} KM | {vehicle.register_emirates || 'UAE'}</Text>
                        <View style={styles.priceRow}>
                            <View>
                                <Text style={styles.priceLabel}>Total Amount</Text>
                                <Text style={styles.priceValue}>AED {Number(item.total_amount).toLocaleString()}</Text>
                            </View>
                            <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#000000', '#1a1a00']} style={styles.container}>

                {/* Header */}
                <TopBar onMenuPress={handleMenuPress} onNotificationPress={handleNotificationPress} />

                {/* List Content */}
                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#cadb2a" />
                    </View>
                ) : (
                    <FlatList
                        data={bookings}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#cadb2a" />
                        }
                        ListEmptyComponent={
                            <View style={styles.centerContainer}>
                                <Feather name="calendar" size={50} color="#333" />
                                <Text style={styles.emptyText}>No bookings found.</Text>
                            </View>
                        }
                    />
                )}

                <BottomNav />
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 100, // Space for TopBar
        paddingBottom: 100 // Space for BottomNav
    },
    card: { backgroundColor: '#111', borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#222', overflow: 'hidden' },
    cardInner: { flexDirection: 'row' },
    image: { width: 110, height: 110, resizeMode: 'cover' },
    infoContainer: { flex: 1, padding: 12, justifyContent: 'space-between' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    title: { fontSize: 15, fontWeight: 'bold', color: '#fff', fontFamily: 'Poppins', flex: 1, marginRight: 8 },
    statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
    statusText: { fontSize: 9, fontWeight: '800', fontFamily: 'Poppins' },
    subText: { fontSize: 11, color: '#888', fontFamily: 'Poppins', marginTop: 4 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 },
    priceLabel: { fontSize: 10, color: '#aaa', fontFamily: 'Poppins' },
    priceValue: { fontSize: 16, fontWeight: 'bold', color: '#cadb2a', fontFamily: 'Lato' },
    dateText: { fontSize: 10, color: '#666', fontFamily: 'Poppins', marginBottom: 2 },
    emptyText: { color: '#666', marginTop: 15, fontSize: 16, fontFamily: 'Poppins' }
});