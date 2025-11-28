import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Modal,
    Image,
} from 'react-native';

const { width } = Dimensions.get('window');

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ visible, title, message, onClose }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    { }
                    <Text style={styles.modalTitle}>{title}</Text>

                    { }
                    <Text style={styles.modalMessage}>{message}</Text>

                    { }
                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
    },
    modalView: {
        width: width * 0.85,
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderColor: '#CADB2A',
        borderWidth: 1.5,
    },
    icon: {
        width: 50,
        height: 50,
        marginBottom: 15,
        tintColor: '#CADB2A',
        resizeMode: 'contain',
    },
    modalTitle: {
        fontFamily: 'Borg9',
        fontSize: 22,
        color: '#FFFFFF',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalMessage: {
        fontFamily: 'Baloo Thambi 2',
        fontSize: 16,
        color: '#E0E0E0',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
    },
    button: {
        backgroundColor: '#CADB2A',
        borderRadius: 18,
        paddingVertical: 15,
        width: '100%',
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
    },
});

export default CustomAlert;