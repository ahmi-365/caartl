import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import apiService from '../services/ApiService';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';

export default function ContactInquiryScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { showAlert } = useAlert();
    const { user } = useAuth();

    const [firstName, setFirstName] = useState(user?.name ? user.name.split(' ')[0] : '');
    const [lastName, setLastName] = useState(user?.name && user.name.split(' ').length > 1 ? user.name.split(' ')[1] : '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [message, setMessage] = useState('');
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!firstName || !lastName || !email || !message) {
            showAlert("Error", "Please fill all required fields.");
            return;
        }

        if (!termsAgreed) {
            showAlert("Error", "Please agree to the terms and conditions.");
            return;
        }

        setSubmitting(true);
        const formData = new FormData();
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('message', message);
        formData.append('terms_agreed', '1');

        try {
            const result = await apiService.submitContact(formData);
            if (result.success) {
                showAlert("Success", "Message sent successfully! We will contact you soon.");
                navigation.goBack();
            } else {
                const msg = result.data?.message || "Failed to send message.";
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
                    <Text style={styles.headerTitle}>Contact Us</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <Text style={styles.sectionTitle}>Get in Touch</Text>
                    <Text style={styles.sectionSub}>We'd love to hear from you. Fill out the form below.</Text>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.label}>First Name</Text>
                            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="John" placeholderTextColor="#666" />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Last Name</Text>
                            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Doe" placeholderTextColor="#666" />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="john@example.com" placeholderTextColor="#666" />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone (Optional)</Text>
                        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+971..." placeholderTextColor="#666" />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Message</Text>
                        <TextInput style={[styles.input, { height: 120, textAlignVertical: 'top' }]} value={message} onChangeText={setMessage} multiline placeholder="How can we help you?" placeholderTextColor="#666" />
                    </View>

                    <TouchableOpacity style={styles.checkboxContainer} onPress={() => setTermsAgreed(!termsAgreed)}>
                        <MaterialCommunityIcons
                            name={termsAgreed ? "checkbox-marked" : "checkbox-blank-outline"}
                            size={24}
                            color={termsAgreed ? "#cadb2a" : "#666"}
                        />
                        <Text style={styles.checkboxText}>I agree to the terms and conditions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
                        {submitting ? <ActivityIndicator color="#000" /> : <Text style={styles.submitBtnText}>Send Message</Text>}
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
    sectionTitle: { color: '#cadb2a', fontSize: 24, fontWeight: 'bold', marginBottom: 5, fontFamily: 'Poppins' },
    sectionSub: { color: '#888', fontSize: 14, marginBottom: 25, fontFamily: 'Poppins' },

    row: { flexDirection: 'row', justifyContent: 'space-between' },
    inputGroup: { marginBottom: 15 },
    label: { color: '#ccc', fontSize: 14, marginBottom: 5, fontFamily: 'Poppins' },
    input: { backgroundColor: '#111', borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 12, color: '#fff', fontSize: 14, fontFamily: 'Poppins' },

    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    checkboxText: { color: '#ccc', marginLeft: 10, fontSize: 14, fontFamily: 'Poppins' },

    submitBtn: { backgroundColor: '#cadb2a', borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 10 },
    submitBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});