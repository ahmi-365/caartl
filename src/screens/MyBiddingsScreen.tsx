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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import apiService from '../services/ApiService';
import { useAlert } from '../context/AlertContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as Models from '../data/modal';

const { width } = Dimensions.get('window');

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

export default function MyBiddingsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();
    const { showAlert } = useAlert();

    const [bids, setBids] = useState<Models.Bid[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBids = async () => {
        try {
            const result = await apiService.getUserBiddings();
            if (result.success && Array.isArray(result.data.data)) {
                // Sort by latest created_at
                const sortedBids = result.data.data.sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setBids(sortedBids);
            } else {
                setBids([]);
            }
        } catch (error) {
            console.error(error);
            showAlert('Error', 'Failed to fetch bids.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBids();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchBids();
    };

    const getImageUrl = (vehicle: any) => {
        if (!vehicle) return 'https://via.placeholder.com/400x250';
        if (vehicle.cover_image) {
            if (typeof vehicle.cover_image === 'string') return vehicle.cover_image;
            if (typeof vehicle.cover_image === 'object' && vehicle.cover_image.path) return vehicle.cover_image.path;
        }
        if (vehicle.images && Array.isArray(vehicle.images) && vehicle.images.length > 0) return vehicle.images[0].path;
        if (vehicle.brand && vehicle.brand.image_source) return vehicle.brand.image_source;
        return 'https://c.animaapp.com/mg9397aqkN2Sch/img/tesla.png';
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return '#ffaa00'; // Orange
            case 'accepted': return '#cadb2a'; // Green/Brand
            case 'rejected': return '#ff4444'; // Red
            default: return '#888';
        }
    };

    const getStatusLabel = (status: string) => {
        return status ? status.toUpperCase() : 'UNKNOWN';
    };

    // 🟢 Fixed Navigation logic for nested drawer
    const handleBackPress = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            // @ts-ignore
            navigation.navigate('DrawerRoot', { screen: 'ListedVehicles' });
        }
    };

    const handleCardPress = (bid: Models.Bid) => {
        if (!bid.vehicle) return;
        if (bid.status === 'accepted') {
            navigation.navigate('LiveAuction', {
                carId: bid.vehicle.id,
                viewType: 'negotiation'
            });
        } else {
            navigation.navigate('LiveAuction', {
                carId: bid.vehicle.id,
                viewType: 'live'
            });
        }
    };

    const renderItem = ({ item }: { item: Models.Bid }) => {
        const vehicle = item.vehicle;
        if (!vehicle) return null;

        const brandName = vehicle.brand?.name || '';
        const modelName = vehicle.vehicle_model?.name || '';
        const title = `${brandName} ${modelName}`;
        const statusColor = getStatusColor(item.status);

        return (
            <TouchableOpacity
                activeOpacity={0.95}
                style={styles.card}
                onPress={() => handleCardPress(item)}
            >
                <View style={styles.imageContainer}>
                    <Image source={{ uri: getImageUrl(vehicle) }} style={styles.image} resizeMode="cover" />
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Text style={[styles.statusText, { color: item.status === 'accepted' ? '#000' : '#fff' }]}>
                            {getStatusLabel(item.status)}
                        </Text>
                    </View>
                </View>

                <View style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <Text style={styles.title} numberOfLines={1}>{title}</Text>
                        <Text style={styles.year}>{vehicle.year}</Text>
                    </View>
                    <Text style={styles.subtitle} numberOfLines={1}>
                        {vehicle.trim || vehicle.variant || `${vehicle.mileage || 0} KM`}
                    </Text>
                    <View style={styles.divider} />
                    <View style={styles.footerRow}>
                        <View>
                            <Text style={styles.label}>My Bid Amount</Text>
                            <Text style={styles.bidValue}>AED {Number(item.bid_amount).toLocaleString()}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.label}>Bid Date</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Feather name="calendar" size={12} color="#666" style={{ marginRight: 4 }} />
                                <Text style={styles.dateText}>{formatDate(item.bid_time || item.created_at)}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#000000', '#1a1a00']} style={styles.container}>

                <View style={[styles.customHeader, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.screenTitle}>My Biddings</Text>
                    <View style={{ width: 40 }} />
                </View>

                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#cadb2a" />
                    </View>
                ) : (
                    <FlatList
                        data={bids}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#cadb2a" />
                        }
                        ListEmptyComponent={
                            <View style={styles.centerContainer}>
                                {/* 🟢 Fixed Icon Type */}
                                <MaterialCommunityIcons name="gavel" size={50} color="#333" />
                                <Text style={styles.emptyText}>No bids found.</Text>
                            </View>
                        }
                    />
                )}
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: 'transparent',
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    screenTitle: { color: '#fff', fontSize: 18, fontFamily: 'Poppins', fontWeight: 'bold' },

    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    listContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },

    card: {
        backgroundColor: '#111',
        borderRadius: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#222',
        overflow: 'hidden',
        elevation: 5,
    },
    imageContainer: { height: 160, width: '100%', position: 'relative' },
    image: { width: '100%', height: '100%' },
    statusBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: { fontSize: 11, fontWeight: 'bold', fontFamily: 'Poppins' },
    contentContainer: { padding: 16 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    title: { fontSize: 18, fontWeight: '700', color: '#fff', fontFamily: 'Poppins', flex: 1, marginRight: 10 },
    year: { fontSize: 16, color: '#ccc', fontFamily: 'Lato', fontWeight: '600' },
    subtitle: { fontSize: 13, color: '#888', fontFamily: 'Poppins', marginBottom: 12 },
    divider: { height: 1, backgroundColor: '#222', marginBottom: 12 },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    label: { fontSize: 11, color: '#666', fontFamily: 'Poppins', marginBottom: 2, textTransform: 'uppercase' },
    bidValue: { fontSize: 20, fontWeight: 'bold', color: '#cadb2a', fontFamily: 'Lato' },
    dateText: { fontSize: 13, color: '#ccc', fontFamily: 'Poppins', fontWeight: '500' },
    emptyText: { color: '#666', marginTop: 15, fontSize: 16, fontFamily: 'Poppins' }
});