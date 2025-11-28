import React, { createContext, useState, useContext, ReactNode } from 'react';
import CustomAlert from '../components/ui/CustomAlert';

interface AlertContextType {
    showAlert: (title: string, message: string) => void;
}

const AlertContext = createContext<AlertContextType>({} as AlertContextType);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [visible, setVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');

    const showAlert = (alertTitle: string, alertMessage: string) => {
        setTitle(alertTitle);
        setMessage(alertMessage);
        setVisible(true);
    };

    const hideAlert = () => {
        setVisible(false);
    };

    const value = { showAlert };

    return (
        <AlertContext.Provider value={value}>
            {children}
            <CustomAlert
                visible={visible}
                title={title}
                message={message}
                onClose={hideAlert}
            />
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    return useContext(AlertContext);
};