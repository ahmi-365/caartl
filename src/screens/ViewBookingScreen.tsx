import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import apiService from '../services/ApiService';
import { useAlert } from '../context/AlertContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type ViewBookingRouteProp = RouteProp<RootStackParamList, 'ViewBooking'>;
const { width, height } = Dimensions.get('window');

// Image Preview Modal
const ImagePreviewModal = ({ visible, imageUrl, onClose }: { visible: boolean, imageUrl: string, onClose: () => void }) => (
    <Modal visible={visible} transparent={true} onRequestClose={onClose} animationType="fade">
        <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Feather name="x" size={30} color="#fff" />
            </TouchableOpacity>
            <Image source={{ uri: imageUrl }} style={styles.fullscreenImage} resizeMode="contain" />
        </View>
    </Modal>
);

export default function ViewBookingScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<ViewBookingRouteProp>();
    const { vehicleId } = route.params;
    const insets = useSafeAreaInsets();
    const { showAlert } = useAlert();

    const [booking, setBooking] = useState<any>(null);
    const [vehicle, setVehicle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [parsedServices, setParsedServices] = useState<any[]>([]);

    // Image Preview State
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                const result = await apiService.apiCall<any>(`/get-bookings?vehicle_id=${vehicleId}`);

                if (result.success && result.data?.data?.data && result.data.data.data.length > 0) {
                    // Get the latest booking (first item)
                    const latestBooking = result.data.data.data[0];
                    setBooking(latestBooking);
                    setVehicle(latestBooking.vehicle);

                    // Parse Services (API returns it as a JSON string)
                    if (latestBooking.services) {
                        try {
                            const servicesArray = typeof latestBooking.services === 'string'
                                ? JSON.parse(latestBooking.services)
                                : latestBooking.services;
                            setParsedServices(servicesArray);
                        } catch (e) {
                            console.log("Error parsing services JSON", e);
                        }
                    }
                } else {
                    showAlert("Error", "No booking details found.");
                    navigation.goBack();
                }
            } catch (error) {
                console.error(error);
                showAlert("Error", "Failed to load booking.");
            } finally {
                setLoading(false);
            }
        };

        fetchBookingDetails();
    }, [vehicleId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending_payment': return '#ffaa00';
            case 'intransfer': return '#00a8ff';
            case 'delivered': return '#cadb2a';
            case 'completed': return '#cadb2a';
            default: return '#888';
        }
    };

    // 🟢 UPDATED STATUS LABEL
    const getStatusLabel = (status: string) => {
        if (status === 'pending_payment') return 'PAYMENT CONFIRMATION PENDING';
        return status ? status.replace('_', ' ').toUpperCase() : 'UNKNOWN';
    };

    const getImageUrl = (v: any) => {
        if (!v) return 'https://via.placeholder.com/300';
        if (v.cover_image && typeof v.cover_image === 'string') return v.cover_image;
        if (v.images && v.images.length > 0) return v.images[0].path;
        return 'https://c.animaapp.com/mg9397aqkN2Sch/img/tesla.png';
    };

    const handleImagePress = (uri: string) => {
        if (uri) setPreviewImage(uri);
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#cadb2a" />
            </View>
        );
    }

    if (!booking) return null;

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#000000', '#1a1a00']} style={styles.container}>

                {/* Header */}
                <View style={[styles.header, { paddingTop: 20 }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Feather name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Booking Details</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Status Banner */}
                    <View style={[styles.statusCard, { borderColor: getStatusColor(booking.status) }]}>
                        <Feather name="info" size={24} color={getStatusColor(booking.status)} />
                        <View style={{ marginLeft: 15, flex: 1 }}>
                            <Text style={[styles.statusTitle, { color: getStatusColor(booking.status) }]}>
                                {getStatusLabel(booking.status)}
                            </Text>
                            <Text style={styles.statusSub}>Booking ID: #{booking.id}</Text>
                            <Text style={styles.statusSub}>{new Date(booking.created_at).toDateString()}</Text>
                        </View>
                    </View>

                    {/* Vehicle Card */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Vehicle</Text>
                        <View style={styles.vehicleCard}>
                            <Image source={{ uri: getImageUrl(vehicle) }} style={styles.vehicleImage} />
                            <View style={styles.vehicleInfo}>
                                <Text style={styles.vehicleTitle} numberOfLines={2}>{vehicle?.title}</Text>
                                <Text style={styles.vehicleSub}>{vehicle?.year} | {vehicle?.mileage} KM</Text>
                                <Text style={styles.vehiclePrice}>Price: AED {Number(vehicle?.price || vehicle?.current_bid).toLocaleString()}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Financial Breakdown */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Payment Summary</Text>
                        <View style={styles.card}>
                            {/* Services Loop */}
                            {parsedServices.map((s: any, index: number) => (
                                <View key={index} style={styles.row}>
                                    <Text style={styles.label}>{s.name}</Text>
                                    <Text style={styles.value}>AED {Number(s.price).toLocaleString()}</Text>
                                </View>
                            ))}

                            <View style={styles.row}>
                                <Text style={styles.label}>Delivery ({booking.delivery_type})</Text>
                                <Text style={styles.value}>AED {Number(booking.delivery_charges).toLocaleString()}</Text>
                            </View>

                            <View style={[styles.row, styles.totalRow]}>
                                <Text style={styles.totalLabel}>Total Amount</Text>
                                <Text style={styles.totalValue}>AED {Number(booking.total_amount).toLocaleString()}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Locations */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Delivery Info</Text>
                        <View style={styles.card}>
                            <View style={styles.infoRow}>
                                <Feather name="map-pin" size={16} color="#cadb2a" />
                                <View style={{ marginLeft: 10, flex: 1 }}>
                                    <Text style={styles.label}>Current Location</Text>
                                    <Text style={styles.value}>{booking.current_location || 'N/A'}</Text>
                                </View>
                            </View>
                            <View style={[styles.infoRow, { marginTop: 15 }]}>
                                <Feather name="navigation" size={16} color="#cadb2a" />
                                <View style={{ marginLeft: 10, flex: 1 }}>
                                    <Text style={styles.label}>Delivery Address</Text>
                                    <Text style={styles.value}>{booking.delivery_location || 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Contact Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact Details</Text>
                        <View style={styles.card}>
                            <View style={styles.row}><Text style={styles.label}>Name</Text><Text style={styles.value}>{booking.receiver_name}</Text></View>
                            <View style={styles.row}><Text style={styles.label}>Email</Text><Text style={styles.value}>{booking.receiver_email}</Text></View>
                            <View style={styles.row}><Text style={styles.label}>Phone</Text><Text style={styles.value}>{booking.receiver_phone || 'N/A'}</Text></View>
                        </View>
                    </View>

                    {/* Documents */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Uploaded Documents</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 5 }}>
                            {booking.payment_screenshot && (
                                <TouchableOpacity onPress={() => handleImagePress(booking.payment_screenshot)} style={styles.docItem}>
                                    <Image source={{ uri: booking.payment_screenshot }} style={styles.docImage} />
                                    <Text style={styles.docLabel}>Payment Slip</Text>
                                </TouchableOpacity>
                            )}
                            {booking.emirate_id_front && (
                                <TouchableOpacity onPress={() => handleImagePress(booking.emirate_id_front)} style={styles.docItem}>
                                    <Image source={{ uri: booking.emirate_id_front }} style={styles.docImage} />
                                    <Text style={styles.docLabel}>ID Front</Text>
                                </TouchableOpacity>
                            )}
                            {booking.emirate_id_back && (
                                <TouchableOpacity onPress={() => handleImagePress(booking.emirate_id_back)} style={styles.docItem}>
                                    <Image source={{ uri: booking.emirate_id_back }} style={styles.docImage} />
                                    <Text style={styles.docLabel}>ID Back</Text>
                                </TouchableOpacity>
                            )}
                        </ScrollView>
                    </View>

                    <View style={{ height: 50 }} />

                </ScrollView>

                <ImagePreviewModal
                    visible={!!previewImage}
                    imageUrl={previewImage || ''}
                    onClose={() => setPreviewImage(null)}
                />
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 15 },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', fontFamily: 'Poppins' },
    scrollContent: { padding: 16 },

    statusCard: { backgroundColor: '#111', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
    statusTitle: { fontSize: 16, fontWeight: 'bold', fontFamily: 'Poppins' },
    statusSub: { color: '#888', fontSize: 12, fontFamily: 'Poppins', marginTop: 2 },

    section: { marginBottom: 25 },
    sectionTitle: { color: '#cadb2a', fontSize: 16, fontWeight: 'bold', marginBottom: 10, fontFamily: 'Poppins' },

    vehicleCard: { flexDirection: 'row', backgroundColor: '#111', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#222' },
    vehicleImage: { width: 90, height: 70, borderRadius: 8, marginRight: 15, backgroundColor: '#333' },
    vehicleInfo: { flex: 1, justifyContent: 'center' },
    vehicleTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', fontFamily: 'Poppins' },
    vehicleSub: { color: '#888', fontSize: 12, marginTop: 4, fontFamily: 'Poppins' },
    vehiclePrice: { color: '#cadb2a', fontSize: 14, fontWeight: 'bold', marginTop: 4, fontFamily: 'Lato' },

    card: { backgroundColor: '#111', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: '#222' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    label: { color: '#aaa', fontSize: 13, fontFamily: 'Poppins' },
    value: { color: '#fff', fontSize: 13, fontFamily: 'Poppins', fontWeight: '500', flexShrink: 1, textAlign: 'right' },

    totalRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#333', alignItems: 'center' },
    totalLabel: { color: '#fff', fontSize: 15, fontWeight: 'bold', fontFamily: 'Poppins' },
    totalValue: { color: '#cadb2a', fontSize: 18, fontWeight: 'bold', fontFamily: 'Lato' },

    infoRow: { flexDirection: 'row', alignItems: 'flex-start' },

    docItem: { marginRight: 15, alignItems: 'center' },
    docImage: { width: 100, height: 70, borderRadius: 8, borderWidth: 1, borderColor: '#333', backgroundColor: '#000' },
    docLabel: { color: '#aaa', fontSize: 11, marginTop: 5, fontFamily: 'Poppins' },

    // Modal
    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
    closeBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10 },
    fullscreenImage: { width: '100%', height: '80%' },
});