import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import apiService from '../services/ApiService';
import { useAlert } from '../context/AlertContext';

export default function ChangePasswordScreen() {
    const navigation = useNavigation();
    const { showAlert } = useAlert();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            return showAlert('Error', 'Please fill in all fields.');
        }
        if (newPassword !== confirmPassword) {
            return showAlert('Error', 'New passwords do not match.');
        }

        setLoading(true);
        try {
            const result = await apiService.changePassword({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword
            });

            if (result.success) {
                showAlert('Success', 'Your password has been changed successfully!');
                navigation.goBack();
            } else {
                // API might return error message in data.message or just fail
                showAlert('Error', result.data.message || 'Failed to change password. Check your current password.');
            }
        } catch (error) {
            console.error(error);
            showAlert('Error', 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <LinearGradient colors={['rgba(202, 219, 42, 0)', 'rgba(202, 219, 42, 0.2)']} style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Change Password</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Current Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter current password"
                            placeholderTextColor="#666"
                            secureTextEntry
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>New Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter new password"
                            placeholderTextColor="#666"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm New Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm new password"
                            placeholderTextColor="#666"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleChangePassword}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitText}>Update Password</Text>}
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 50 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
    backButton: { marginRight: 15 },
    headerTitle: { fontSize: 20, fontWeight: '600', color: '#fff', fontFamily: 'Poppins' },
    form: { flex: 1 },
    inputGroup: { marginBottom: 20 },
    label: { color: '#cadb2a', marginBottom: 8, fontSize: 14, fontFamily: 'Poppins' },
    input: { backgroundColor: '#111', borderRadius: 12, padding: 15, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#333' },
    submitButton: { backgroundColor: '#cadb2a', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 20 },
    submitText: { color: '#000', fontWeight: '700', fontSize: 16, fontFamily: 'Poppins' },
});