import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';

export default function InquiryTypeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#000000', '#1a1a00']} style={styles.container}>
                <View style={[styles.header, { paddingTop: 10 }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Inquiries</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.content}>
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('SellCarInquiry')}
                    >
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="car-key" size={32} color="#000" />
                        </View>
                        <View>
                            <Text style={styles.cardTitle}>Sell Car Inquiry</Text>
                            <Text style={styles.cardSub}>Submit details to sell your car</Text>
                        </View>
                        <Feather name="chevron-right" size={24} color="#666" style={{ marginLeft: 'auto' }} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('AppointmentInquiry')}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: '#fff' }]}>
                            <Feather name="calendar" size={32} color="#000" />
                        </View>
                        <View>
                            <Text style={styles.cardTitle}>Appointment Inquiry</Text>
                            <Text style={styles.cardSub}>Book an appointment with us</Text>
                        </View>
                        <Feather name="chevron-right" size={24} color="#666" style={{ marginLeft: 'auto' }} />
                    </TouchableOpacity>

                    {/* 🟢 NEW: Contact Us Button */}
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('ContactInquiry')}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: '#ff4444' }]}>
                            <Feather name="mail" size={32} color="#fff" />
                        </View>
                        <View>
                            <Text style={styles.cardTitle}>Contact Us</Text>
                            <Text style={styles.cardSub}>General inquiries & support</Text>
                        </View>
                        <Feather name="chevron-right" size={24} color="#666" style={{ marginLeft: 'auto' }} />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 20 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff', fontFamily: 'Poppins' },
    content: { padding: 20 },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 16, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
    iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#cadb2a', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', fontFamily: 'Poppins' },
    cardSub: { color: '#888', fontSize: 12, fontFamily: 'Poppins', marginTop: 4 },
});