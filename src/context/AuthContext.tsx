import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Models from '../data/modal';
import apiService from '../services/ApiService';

interface AuthContextType {
    userToken: string | null;
    user: Models.User | null;
    isLoading: boolean;
    isGuest: boolean;        // 🟢 true if user is guest (id === 0)
    isApproved: boolean;     // 🟢 true if user is approved (is_approved === 1)
    isUnapproved: boolean;   // 🟢 true if logged in but not approved
    login: (credentials: any) => Promise<boolean>;
    register: (userData: any) => Promise<boolean>;
    logout: () => void;
    updateUser: (user: Models.User) => void;
    guestLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState<string | null>(null);
    const [user, setUser] = useState<Models.User | null>(null);

    const normalizeUser = (inputUser: Models.User | null): Models.User | null => {
        if (!inputUser) return null;
        const hasApproval = typeof inputUser.is_approved === 'number';
        const resolvedApproval = hasApproval
            ? inputUser.is_approved
            : (inputUser.status === 'pending' ? 0 : 1);
        return {
            ...inputUser,
            is_approved: resolvedApproval,
        };
    };

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
                    // Validate token with profile endpoint
                    const result = await apiService.getUserProfile();

                    // If successful (success: true means 200 OK and valid JSON)
                    if (result.success && result.data.data) {
                        userData = normalizeUser(result.data.data);
                        await AsyncStorage.setItem('userData', JSON.stringify(userData));
                    } else {
                        // If result.success is false (e.g. 401 or HTML error), log out.
                        console.log("Token invalid, expired, or server error. Logging out.");
                        token = null;
                        userData = null;
                        await AsyncStorage.multiRemove(['userToken', 'userData']);
                    }
                }
            } catch (e) {
                console.error('Restoring auth state failed', e);
                token = null;
                userData = null;
            } finally {
                setUserToken(token);
                setUser(userData);
                setIsLoading(false);
            }
        };

        bootstrapAsync();
    }, []);

    const login = async (credentials: any) => {
        const result = await apiService.login(credentials);
        if (result.success && result.data.access_token) {
            const { access_token, user } = result.data;
            const normalizedUser = normalizeUser(user);
            setUserToken(access_token);
            setUser(normalizedUser);
            await apiService.storeUserData(normalizedUser, access_token);
            return true;
        }
        return false;
    };

    const register = async (userData: any) => {
        const result = await apiService.register(userData);
        if (result.success && result.data.token) {
            const { token, user } = result.data;
            const normalizedUser = normalizeUser(user);
            setUserToken(token);
            setUser(normalizedUser);
            await apiService.storeUserData(normalizedUser, token);
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

    const updateUser = async (newUser: Models.User) => {
        setUser(newUser);
        await AsyncStorage.setItem('userData', JSON.stringify(newUser));
    };

    // 🟢 ADD: Guest login method
    const guestLogin = async () => {
        const guestUser: Models.User = {
            id: 0, // 0 for guest
            agent_id: null,
            is_approved: 0,
            name: 'Guest',
            email: '',
            email_verified_at: null,
            bio: null,
            phone: '',
            photo: null,
            target: null,
            created_at: '',
            updated_at: '',
            roles: ['guest'],
            role: 'guest',
            permissions: [],
            package_id: null,
        };
        setUserToken(null);
        setUser(guestUser);
        await AsyncStorage.setItem('userData', JSON.stringify(guestUser));
        await AsyncStorage.removeItem('userToken');
    };

    // 🟢 Computed properties for approval status
    const isGuest = !!user && user.id === 0;
    const isApproved = !!user && !isGuest && user.is_approved === 1;
    const isUnapproved = !!user && !isGuest && user.is_approved === 0; // Logged in but not approved

    const value = {
        userToken,
        user,
        isLoading,
        isGuest,
        isApproved,
        isUnapproved,
        login,
        register,
        logout,
        updateUser,
        guestLogin,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};