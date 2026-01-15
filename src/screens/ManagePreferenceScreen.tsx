import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Keyboard,
    Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import apiService from '../services/ApiService';
import * as Models from '../data/modal';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAlert } from '../context/AlertContext';

type ManagePrefRouteProp = RouteProp<RootStackParamList, 'ManagePreference'>;

const SPECS_LIST = [
    'GCC Specs',
    'European Specs',
    'Japanese Specs',
    'North American Specs',
    'Others',
    'Canadian Spec',
    'Chinese Spec',
    'Korean Spec'
];

// --- COMPONENTS DEFINED OUTSIDE ---

const RangeInput = ({ label, fromVal, setFrom, toVal, setTo, placeholder }: any) => (
    <View style={styles.rangeContainer}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.rangeRow}>
            <TextInput
                style={styles.inputHalf}
                placeholder={placeholder ? String(placeholder) : "Min"}
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={fromVal}
                onChangeText={setFrom}
            />
            <Text style={styles.toText}>To</Text>
            <TextInput
                style={styles.inputHalf}
                placeholder={placeholder ? String(placeholder + 5) : "Max"}
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={toVal}
                onChangeText={setTo}
            />
        </View>
    </View>
);

const SearchableDropdown = ({ data, onSelect, placeholder }: { data: Models.Brand[], onSelect: (name: string) => void, placeholder: string }) => {
    const [searchText, setSearchText] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredData = data.filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()));

    return (
        <View style={styles.dropdownContainer}>
            <TouchableOpacity
                style={styles.dropdownHeader}
                onPress={() => setIsOpen(!isOpen)}
                activeOpacity={0.8}
            >
                <Text style={[styles.dropdownText, !searchText && { color: '#666' }]}>
                    {isOpen ? 'Select a Make...' : placeholder}
                </Text>
                <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={20} color="#cadb2a" />
            </TouchableOpacity>

            {isOpen && (
                <View style={styles.dropdownBody}>
                    <View style={styles.searchRow}>
                        <Feather name="search" size={18} color="#666" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Type to search..."
                            placeholderTextColor="#666"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>
                    <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                        {filteredData.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.dropdownItem}
                                onPress={() => {
                                    onSelect(item.name);
                                    setSearchText('');
                                    setIsOpen(false);
                                    Keyboard.dismiss();
                                }}
                            >
                                <Text style={styles.dropdownItemText}>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

export default function ManagePreferenceScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<ManagePrefRouteProp>();
    const insets = useSafeAreaInsets();
    const { showAlert } = useAlert();

    const { preferenceId, preferenceData } = route.params || {};
    const isEdit = !!preferenceId;

    const [loadingData, setLoadingData] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [allMakes, setAllMakes] = useState<Models.Brand[]>([]);

    // Form State
    const [name, setName] = useState('');
    const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
    const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);

    const [yearFrom, setYearFrom] = useState('');
    const [yearTo, setYearTo] = useState('');
    const [priceFrom, setPriceFrom] = useState('');
    const [priceTo, setPriceTo] = useState('');
    const [mileageFrom, setMileageFrom] = useState('');
    const [mileageTo, setMileageTo] = useState('');

    useEffect(() => {
        const loadMakes = async () => {
            setLoadingData(true);
            const res = await apiService.getMakes();
            if (res.success) {
                setAllMakes(res.data.data);
            }
            setLoadingData(false);
        };
        loadMakes();

        if (isEdit && preferenceData) {
            setName(preferenceData.name);

            const parseList = (data: any) => {
                if (Array.isArray(data)) return data;
                if (typeof data === 'string') {
                    if (data.trim().startsWith('[') && data.trim().endsWith(']')) {
                        try { return JSON.parse(data); } catch (e) { return [data]; }
                    }
                    return [data];
                }
                return [];
            };

            setSelectedMakes(parseList(preferenceData.make));

            if (typeof preferenceData.specs === 'object' && preferenceData.specs !== null && !Array.isArray(preferenceData.specs)) {
                const values = Object.values(preferenceData.specs).map(String);
                setSelectedSpecs(values);
            } else {
                setSelectedSpecs(parseList(preferenceData.specs));
            }

            // Cleaning values for display
            const clean = (val: any) => val ? String(Math.floor(Number(val))) : '';

            setYearFrom(clean(preferenceData.year_form));
            setYearTo(clean(preferenceData.year_to));
            setPriceFrom(clean(preferenceData.price_from));
            setPriceTo(clean(preferenceData.price_to));
            setMileageFrom(clean(preferenceData.mileage_form));
            setMileageTo(clean(preferenceData.mileage_to));
        }
    }, [isEdit, preferenceData]);

    const toggleSelection = (list: string[], setList: (l: string[]) => void, item: string) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    // 🟢 FORMATTING HELPERS
    // For Prices: adds .00
    const formatPrice = (val: string) => {
        if (!val) return null;
        const num = parseFloat(val);
        if (isNaN(num)) return null;
        return num.toFixed(2);
    };

    // For Integers (Year, Mileage): removes decimals
    const formatInt = (val: string) => {
        if (!val) return null;
        const num = parseFloat(val);
        if (isNaN(num)) return null;
        return String(Math.floor(num));
    };

    const handleSave = async () => {
        if (!name.trim()) {
            showAlert("Error", "Preference name is required.");
            return;
        }

        setSubmitting(true);

        const payload = {
            name,
            make: selectedMakes.length > 0 ? JSON.stringify(selectedMakes) : null,
            specs: selectedSpecs,

            // Integer Fields
            year_form: formatInt(yearFrom),
            year_to: formatInt(yearTo),
            mileage_form: formatInt(mileageFrom),
            mileage_to: formatInt(mileageTo),

            // Price Fields (Decimal)
            price_from: formatPrice(priceFrom),
            price_to: formatPrice(priceTo),

            is_active: true
        };

        try {
            let result;
            if (isEdit && preferenceId) {
                result = await apiService.updatePreference(preferenceId, payload);
            } else {
                result = await apiService.createPreference(payload);
            }

            if (result.success) {
                showAlert("Success", "Preference saved successfully!");
                navigation.goBack();
            } else {
                console.log("Save Error Data:", result.data);

                // 🟢 Handle Database Range Errors specifically
                // @ts-ignore
                if (result.data?.error?.includes("Out of range")) {
                    showAlert("Error", "Value too large. Please check price or mileage limits.");
                } else {
                    const msg = result.data?.message || "Failed to save preference.";
                    showAlert("Error", msg);
                }
            }
        } catch (e) {
            console.error(e);
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
                        <Feather name="chevron-left" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{isEdit ? 'Edit Preference' : 'Select Preferences'}</Text>
                    <TouchableOpacity onPress={() => {
                        setName(''); setSelectedMakes([]); setSelectedSpecs([]); setYearFrom(''); setYearTo(''); setPriceFrom(''); setPriceTo(''); setMileageFrom(''); setMileageTo('');
                    }}>
                        <Text style={styles.resetText}>Reset</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                    {/* Preference Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Preference Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. My Dream SUV"
                            placeholderTextColor="#666"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* MAKES SELECTION */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Make</Text>

                        <View style={styles.wrapList}>
                            {selectedMakes.map((make, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.chipSelected}
                                    onPress={() => toggleSelection(selectedMakes, setSelectedMakes, make)}
                                >
                                    <Text style={styles.chipTextSelected}>{make}</Text>
                                    <Feather name="x" size={14} color="#cadb2a" style={{ marginLeft: 5 }} />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <SearchableDropdown
                            data={allMakes}
                            onSelect={(make) => toggleSelection(selectedMakes, setSelectedMakes, make)}
                            placeholder="Add a Make"
                        />
                    </View>

                    {/* SPECS SELECTION */}
                    <View style={[styles.inputGroup, { marginTop: 10 }]}>
                        <Text style={styles.label}>Specs <Text style={{ color: '#888', fontSize: 12, fontWeight: '400' }}>(GCC Specs default)</Text></Text>
                        <View style={styles.wrapList}>
                            {SPECS_LIST.map((spec) => {
                                const isSelected = selectedSpecs.includes(spec);
                                return (
                                    <TouchableOpacity
                                        key={spec}
                                        style={[styles.chip, isSelected && styles.chipSelected]}
                                        onPress={() => toggleSelection(selectedSpecs, setSelectedSpecs, spec)}
                                    >
                                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{spec}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* RANGES */}
                    <RangeInput label="Year" fromVal={yearFrom} setFrom={setYearFrom} toVal={yearTo} setTo={setYearTo} placeholder={2020} />
                    <RangeInput label="Mileage (KM)" fromVal={mileageFrom} setFrom={setMileageFrom} toVal={mileageTo} setTo={setMileageTo} placeholder={10000} />
                    <RangeInput label="Price (AED)" fromVal={priceFrom} setFrom={setPriceFrom} toVal={priceTo} setTo={setPriceTo} placeholder={50000} />

                    <View style={{ height: 100 }} />
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
                    <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={handleSave}
                        disabled={submitting}
                    >
                        {submitting ? <ActivityIndicator color="#000" /> : <Text style={styles.saveBtnText}>Save Preferences</Text>}
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 15, backgroundColor: 'rgba(0,0,0,0.8)' },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff', fontFamily: 'Poppins' },
    resetText: { color: '#cadb2a', fontSize: 14, fontWeight: '600', fontFamily: 'Poppins' },

    scrollContent: { padding: 20 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 16, fontWeight: '600', color: '#cadb2a', marginBottom: 8, fontFamily: 'Poppins' },

    input: { borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 12, fontSize: 16, fontFamily: 'Poppins', color: '#fff', backgroundColor: '#111' },

    // Dropdown
    dropdownContainer: { marginTop: 5 },
    dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 12, backgroundColor: '#111' },
    dropdownText: { color: '#fff', fontSize: 14, fontFamily: 'Poppins' },
    dropdownBody: { marginTop: 5, borderWidth: 1, borderColor: '#333', borderRadius: 8, backgroundColor: '#111', padding: 10 },
    searchRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 8, marginBottom: 8 },
    searchInput: { flex: 1, marginLeft: 10, color: '#fff', fontSize: 14, fontFamily: 'Poppins' },
    dropdownItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
    dropdownItemText: { color: '#ccc', fontSize: 14, fontFamily: 'Poppins' },

    // Range
    rangeContainer: { marginBottom: 20 },
    rangeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    inputHalf: { width: '45%', borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 12, textAlign: 'center', fontSize: 16, fontFamily: 'Poppins', color: '#fff', backgroundColor: '#111' },
    toText: { fontSize: 14, color: '#fff', fontWeight: 'bold' },

    // Chips
    wrapList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
    chip: { borderWidth: 1, borderColor: '#333', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#111' },
    chipSelected: { borderColor: '#cadb2a', backgroundColor: 'rgba(202, 219, 42, 0.1)', flexDirection: 'row', alignItems: 'center' },
    chipText: { fontSize: 13, color: '#888', fontFamily: 'Poppins' },
    chipTextSelected: { color: '#cadb2a', fontWeight: '600' },

    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#222', backgroundColor: '#000' },
    saveBtn: { backgroundColor: '#cadb2a', padding: 16, borderRadius: 10, alignItems: 'center' },
    saveBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold', fontFamily: 'Poppins' }
});