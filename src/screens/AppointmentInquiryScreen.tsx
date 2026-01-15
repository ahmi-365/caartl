import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Image,
    Platform,
    Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker'; // 🟢 Import Picker

import apiService from '../services/ApiService';
import * as Models from '../data/modal';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';

const BODY_TYPES = [
    { id: 1, name: 'Sedan' },
    { id: 2, name: 'SUV' },
    { id: 3, name: 'Hatchback' },
    { id: 4, name: 'Coupe' },
    { id: 5, name: 'Truck' },
    { id: 6, name: 'Convertible' },
    { id: 7, name: 'Van' }
];

// --- Reusable Searchable Dropdown ---
const SearchableDropdown = ({ data, onSelect, placeholder, labelField = 'name', imageField }: any) => {
    const [searchText, setSearchText] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState('');

    const filteredData = data.filter((item: any) => item[labelField].toLowerCase().includes(searchText.toLowerCase()));

    const handleSelect = (item: any) => {
        setSelectedLabel(item[labelField]);
        onSelect(item);
        setIsOpen(false);
        setSearchText('');
    };

    return (
        <View style={styles.dropdownContainer}>
            <TouchableOpacity style={styles.dropdownHeader} onPress={() => setIsOpen(true)}>
                <Text style={[styles.dropdownText, !selectedLabel && { color: '#666' }]}>
                    {selectedLabel || placeholder}
                </Text>
                <Feather name="chevron-down" size={20} color="#cadb2a" />
            </TouchableOpacity>

            <Modal visible={isOpen} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{placeholder}</Text>
                            <TouchableOpacity onPress={() => setIsOpen(false)}>
                                <Feather name="x" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.searchRow}>
                            <Feather name="search" size={18} color="#666" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search..."
                                placeholderTextColor="#666"
                                value={searchText}
                                onChangeText={setSearchText}
                                autoFocus
                            />
                        </View>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {filteredData.map((item: any) => (
                                <TouchableOpacity key={item.id} style={styles.dropdownItem} onPress={() => handleSelect(item)}>
                                    {imageField && item[imageField] ? (
                                        <Image source={{ uri: item[imageField] }} style={styles.brandIcon} resizeMode="contain" />
                                    ) : null}
                                    <Text style={styles.dropdownItemText}>{item[labelField]}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default function AppointmentInquiryScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { showAlert } = useAlert();
    const { user } = useAuth();

    const [loadingData, setLoadingData] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Dropdown Data
    const [brands, setBrands] = useState<Models.Brand[]>([]);
    const [models, setModels] = useState<Models.VehicleModel[]>([]);
    const [years, setYears] = useState<number[]>([]);

    // Form State
    const [appointmentName, setAppointmentName] = useState('Service Appointment');
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [email, setEmail] = useState(user?.email || '');

    // 🟢 DATE & TIME STATE
    const [date, setDate] = useState(''); // String for API (YYYY-MM-DD)
    const [time, setTime] = useState(''); // String for API (HH:MM AM/PM)
    const [dateObj, setDateObj] = useState(new Date()); // Date Object for Picker
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

    const [location, setLocation] = useState('');

    // Vehicle Details
    const [brandId, setBrandId] = useState<number | null>(null);
    const [modelId, setModelId] = useState<number | null>(null);
    const [year, setYear] = useState<string>('');
    const [bodyType, setBodyType] = useState('');

    useEffect(() => {
        const loadInitialData = async () => {
            setLoadingData(true);
            try {
                const [brandRes, yearRes] = await Promise.all([
                    apiService.getMakes(),
                    apiService.getYears()
                ]);
                if (brandRes.success) setBrands(brandRes.data.data);
                if (yearRes.success) setYears(yearRes.data.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingData(false);
            }
        };
        loadInitialData();
    }, []);

    const handleBrandSelect = async (brand: Models.Brand) => {
        setBrandId(brand.id);
        setModelId(null);
        try {
            const res = await apiService.getModels(brand.id);
            if (res.success) setModels(res.data.data);
        } catch (e) { console.error(e); }
    };

    // 🟢 DATE/TIME PICKER HANDLERS
    const showMode = (currentMode: 'date' | 'time') => {
        setShowPicker(true);
        setPickerMode(currentMode);
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (event.type === 'dismissed') {
            setShowPicker(false);
            return;
        }

        const currentDate = selectedDate || dateObj;
        setShowPicker(Platform.OS === 'ios'); // Keep open on iOS to let user confirm, close on Android
        setDateObj(currentDate);

        if (pickerMode === 'date') {
            // Format: YYYY-MM-DD
            const formattedDate = currentDate.toISOString().split('T')[0];
            setDate(formattedDate);
            if (Platform.OS === 'android') setShowPicker(false);
        } else {
            // Format: HH:MM AM/PM
            let hours = currentDate.getHours();
            const minutes = currentDate.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            const strTime = hours + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + ampm;

            setTime(strTime);
            if (Platform.OS === 'android') setShowPicker(false);
        }
    };

    const handleSubmit = async () => {
        if (!name || !phone || !email || !brandId || !modelId || !year || !date || !time || !location || !bodyType) {
            showAlert("Error", "Please fill all required fields.");
            return;
        }

        setSubmitting(true);
        const formData = new FormData();
        formData.append('name', appointmentName);
        formData.append('phone', phone);
        formData.append('email', email);
        formData.append('date', date);
        formData.append('time', time);
        formData.append('location', location);
        formData.append('make', String(brandId));
        formData.append('model', String(modelId));
        formData.append('year', year);
        formData.append('type', bodyType);

        try {
            const result = await apiService.submitAppointment(formData);
            if (result.success) {
                showAlert("Success", "Appointment request sent successfully!");
                navigation.goBack();
            } else {
                const msg = result.data?.message || "Failed to send request.";
                showAlert("Error", msg);
            }
        } catch (e) {
            showAlert("Error", "Network error.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#000000', '#1a1a00']} style={styles.container}>
                <View style={[styles.header, { paddingTop: 10 }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Book Appointment</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <Text style={styles.sectionTitle}>Appointment Details</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Appointment Title</Text>
                        <TextInput
                            style={styles.input}
                            value={appointmentName}
                            onChangeText={setAppointmentName}
                            placeholder="e.g. Service Appointment"
                            placeholderTextColor="#666"
                        />
                    </View>

                    {/* 🟢 DATE PICKER TRIGGER */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Date</Text>
                        <TouchableOpacity onPress={() => showMode('date')} style={styles.pickerBtn}>
                            <Text style={{ color: date ? '#fff' : '#666', fontSize: 14, fontFamily: 'Poppins' }}>
                                {date || 'YYYY-MM-DD'}
                            </Text>
                            <Feather name="calendar" size={20} color="#cadb2a" />
                        </TouchableOpacity>
                    </View>

                    {/* 🟢 TIME PICKER TRIGGER */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Time</Text>
                        <TouchableOpacity onPress={() => showMode('time')} style={styles.pickerBtn}>
                            <Text style={{ color: time ? '#fff' : '#666', fontSize: 14, fontFamily: 'Poppins' }}>
                                {time || 'HH:MM AM/PM'}
                            </Text>
                            <Feather name="clock" size={20} color="#cadb2a" />
                        </TouchableOpacity>
                    </View>

                    {/* 🟢 NATIVE PICKER COMPONENT */}
                    {showPicker && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={dateObj}
                            mode={pickerMode}
                            is24Hour={false}
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onDateChange}
                            textColor="#fff" // iOS only
                            themeVariant="dark" // iOS only
                        />
                    )}

                    {/* iOS Picker Confirmation Button (since spinner doesn't auto-close) */}
                    {showPicker && Platform.OS === 'ios' && (
                        <View style={styles.iosPickerBtnContainer}>
                            <TouchableOpacity style={styles.iosConfirmBtn} onPress={() => setShowPicker(false)}>
                                <Text style={styles.iosConfirmText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Location</Text>
                        <TextInput
                            style={styles.input}
                            value={location}
                            onChangeText={setLocation}
                            placeholder="e.g. Dubai Marina"
                            placeholderTextColor="#666"
                        />
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Vehicle Details</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Make (Brand)</Text>
                        <SearchableDropdown
                            data={brands}
                            onSelect={handleBrandSelect}
                            placeholder="Select Brand"
                            imageField="image_source"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Model</Text>
                        <SearchableDropdown
                            data={models}
                            onSelect={(m: any) => setModelId(m.id)}
                            placeholder={brandId ? "Select Model" : "Select Brand First"}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Year</Text>
                        <SearchableDropdown
                            data={years.map(y => ({ id: y, name: String(y) }))}
                            onSelect={(y: any) => setYear(y.name)}
                            placeholder="Select Year"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Body Type</Text>
                        <SearchableDropdown
                            data={BODY_TYPES}
                            onSelect={(bt: any) => setBodyType(bt.name)}
                            placeholder="Select Body Type"
                        />
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Contact Info</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Your Phone</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            placeholderTextColor="#666"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Your Email</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            placeholderTextColor="#666"
                        />
                    </View>

                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
                        {submitting ? <ActivityIndicator color="#000" /> : <Text style={styles.submitBtnText}>Submit Request</Text>}
                    </TouchableOpacity>

                    <View style={{ height: 50 }} />
                </ScrollView>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff', fontFamily: 'Poppins' },

    scrollContent: { padding: 20 },
    sectionTitle: { color: '#cadb2a', fontSize: 18, fontWeight: 'bold', marginBottom: 15, fontFamily: 'Poppins' },

    inputGroup: { marginBottom: 15 },
    label: { color: '#ccc', fontSize: 14, marginBottom: 5, fontFamily: 'Poppins' },
    input: { backgroundColor: '#111', borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 12, color: '#fff', fontSize: 14, fontFamily: 'Poppins' },

    // 🟢 Picker Trigger Button
    pickerBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        padding: 12
    },
    // 🟢 iOS Picker Buttons
    iosPickerBtnContainer: { backgroundColor: '#111', padding: 10, alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#333' },
    iosConfirmBtn: { backgroundColor: '#cadb2a', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
    iosConfirmText: { color: '#000', fontWeight: 'bold' },

    dropdownContainer: {},
    dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 12 },
    dropdownText: { color: '#fff', fontSize: 14, fontFamily: 'Poppins' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#111', borderRadius: 12, padding: 15, maxHeight: '80%', borderWidth: 1, borderColor: '#cadb2a' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    modalTitle: { color: '#cadb2a', fontSize: 18, fontWeight: 'bold' },
    searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', borderRadius: 8, paddingHorizontal: 10, marginBottom: 10 },
    searchInput: { flex: 1, marginLeft: 10, color: '#fff', paddingVertical: 10 },
    dropdownItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222', flexDirection: 'row', alignItems: 'center' },
    dropdownItemText: { color: '#ccc', fontSize: 16 },
    brandIcon: { width: 24, height: 24, marginRight: 10 },

    submitBtn: { backgroundColor: '#cadb2a', borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 20 },
    submitBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});