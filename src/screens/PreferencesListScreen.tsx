import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import apiService from '../services/ApiService';
import * as Models from '../data/modal';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAlert } from '../context/AlertContext';

type PrefNavProp = NativeStackNavigationProp<RootStackParamList>;

export default function PreferencesListScreen() {
    const navigation = useNavigation<PrefNavProp>();
    const insets = useSafeAreaInsets();
    const { showAlert } = useAlert();

    const [preferences, setPreferences] = useState<Models.UserPreference[]>([]);
    const [loading, setLoading] = useState(true);

    const [deleteVisible, setDeleteVisible] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const fetchPreferences = async () => {
        setLoading(true);
        try {
            const result = await apiService.getPreferences();
            if (result.success && Array.isArray(result.data.data)) {
                setPreferences(result.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchPreferences();
        }, [])
    );

    const confirmDelete = (id: number) => {
        setSelectedId(id);
        setDeleteVisible(true);
    };

    const handleDeleteAction = async () => {
        setDeleteVisible(false);
        if (selectedId) {
            const result = await apiService.deletePreference(selectedId);
            if (result.success) {
                fetchPreferences();
                showAlert("Success", "Preference deleted successfully.");
            } else {
                showAlert("Error", "Failed to delete preference.");
            }
        }
    };

    // 🟢 UPDATED: Safe parsing of mixed string/JSON data
    const getSafeArray = (data: any): string[] => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (typeof data === 'string') {
            if (data.startsWith('[') && data.endsWith(']')) {
                try { return JSON.parse(data); } catch (e) { return [data]; }
            }
            return [data];
        }
        if (typeof data === 'object') return Object.values(data);
        return [];
    };

    const renderItem = ({ item }: { item: Models.UserPreference }) => {
        const makes = getSafeArray(item.make);
        const specs = getSafeArray(item.specs);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <View style={styles.actions}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('ManagePreference', { preferenceId: item.id, preferenceData: item })}
                            style={styles.iconBtn}
                        >
                            <Feather name="edit-2" size={18} color="#cadb2a" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.iconBtn}>
                            <Feather name="trash-2" size={18} color="#ff4444" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.tagsContainer}>
                    {makes.map((m, i) => (
                        <View key={`m-${i}`} style={styles.tag}><Text style={styles.tagText}>{m}</Text></View>
                    ))}
                    {specs.map((s, i) => (
                        <View key={`s-${i}`} style={styles.tag}><Text style={styles.tagText}>{s}</Text></View>
                    ))}
                    {(item.year_form || item.year_to) && (
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>{item.year_form || 'Any'} - {item.year_to || 'Any'}</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#000000', '#1a1a00']} style={styles.container}>
                <View style={[styles.header, { paddingTop: 10 }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="chevron-left" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>All Preferences</Text>
                    <View style={{ width: 40 }} />
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#cadb2a" />
                    </View>
                ) : (
                    <FlatList
                        data={preferences}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.center}>
                                <Text style={styles.emptyText}>No preferences saved.</Text>
                            </View>
                        }
                    />
                )}

                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('ManagePreference', {})}
                >
                    <Feather name="plus" size={30} color="#000" />
                </TouchableOpacity>

                {/* Custom Modal for Delete Confirmation */}
                <Modal visible={deleteVisible} transparent animationType="fade" onRequestClose={() => setDeleteVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Feather name="alert-triangle" size={40} color="#ff4444" style={{ marginBottom: 10 }} />
                            <Text style={styles.modalTitle}>Delete Preference</Text>
                            <Text style={styles.modalText}>Are you sure you want to delete this?</Text>
                            <View style={styles.modalButtons}>
                                <TouchableOpacity onPress={() => setDeleteVisible(false)} style={styles.cancelBtn}>
                                    <Text style={styles.btnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleDeleteAction} style={styles.deleteBtn}>
                                    <Text style={[styles.btnText, { color: '#fff' }]}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15, backgroundColor: 'rgba(0,0,0,0.8)' },
    backButton: { padding: 5 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', fontFamily: 'Poppins' },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    listContent: { padding: 20, paddingBottom: 100 },
    emptyText: { color: '#888', fontFamily: 'Poppins' },

    card: { backgroundColor: '#111', borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    cardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', fontFamily: 'Poppins' },
    actions: { flexDirection: 'row', gap: 15 },
    iconBtn: { padding: 5 },

    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: { backgroundColor: '#222', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#333' },
    tagText: { color: '#ccc', fontSize: 12, fontFamily: 'Poppins' },

    fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#cadb2a', justifyContent: 'center', alignItems: 'center', elevation: 5 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '80%', backgroundColor: '#111', borderRadius: 15, padding: 25, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, fontFamily: 'Poppins', color: '#fff' },
    modalText: { fontSize: 14, color: '#aaa', marginBottom: 25, textAlign: 'center', fontFamily: 'Poppins' },
    modalButtons: { flexDirection: 'row', gap: 15, width: '100%' },
    cancelBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#222', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
    deleteBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#ff4444', alignItems: 'center' },
    btnText: { fontFamily: 'Poppins', fontWeight: '600', color: '#fff' }
});