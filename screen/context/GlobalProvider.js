import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'
import { router } from "expo-router";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
    const [isLogged, setIsLogged] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const isTokenPresent = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            if (token) {
                console.log("token is present")
                
                const response = await axios.get('http://192.168.1.6:5000/verify', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${token}`
                    }
                });
                setUser(response.data.userInfo)
                setIsLogged(true)
            }
            setLoading(false);
        }
        catch (error) {
            console.error(error.response.data);
            router.push("/sign-in");
        }
        finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        isTokenPresent()
    }, []);

    return (
        <GlobalContext.Provider
            value={{
                isLogged,
                setIsLogged,
                user,
                setUser,
                loading,
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export default GlobalProvider;