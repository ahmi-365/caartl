import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/ApiService';
import * as Models from '../data/modal';

interface AuthContextType {
    userToken: string | null;
    user: Models.User | null;
    isLoading: boolean;
    login: (credentials: any) => Promise<boolean>;
    register: (userData: any) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState<string | null>(null);
    const [user, setUser] = useState<Models.User | null>(null);

    useEffect(() => {
        const bootstrapAsync = async () => {
            let token: string | null = null;
            let userData: Models.User | null = null;
            try {
                token = await AsyncStorage.getItem('userToken');
                const userDataString = await AsyncStorage.getItem('userData');
                if (userDataString) {
                    userData = JSON.parse(userDataString);
                }
                if (token) {
                    const { success } = await apiService.apiCall('/user/profile', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!success) {
                        token = null;
                        userData = null;
                        await AsyncStorage.multiRemove(['userToken', 'userData']);
                    }
                }
            } catch (e) {
                console.error('Restoring auth state failed', e);
            } finally {
                setUserToken(token);
                setUser(userData);
            }
        };

        const minDisplayTime = new Promise(resolve => setTimeout(resolve, 2500));
        const authCheck = bootstrapAsync();

        Promise.all([minDisplayTime, authCheck]).then(() => {
            setIsLoading(false);
        });
    }, []);

    const login = async (credentials: any) => {
        const result = await apiService.login(credentials);
        if (result.success && result.data.access_token) {
            const { access_token, user } = result.data;
            setUserToken(access_token);
            setUser(user);
            await apiService.storeUserData(user, access_token);
            return true;
        }
        return false;
    };

    const register = async (userData: any) => {
        const result = await apiService.register(userData);
        if (result.success && result.data.token) {
            const { token, user } = result.data;
            setUserToken(token);
            setUser(user);
            await apiService.storeUserData(user, token);
            return true;
        }
        return false;
    };

    const logout = async () => {
        await apiService.logout();
        setUserToken(null);
        setUser(null);
        await AsyncStorage.multiRemove(['userToken', 'userData']);
    };

    const value = {
        userToken,
        user,
        isLoading,
        login,
        register,
        logout,
    };

    // FIXED: The closing tag now correctly matches the opening tag.
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};