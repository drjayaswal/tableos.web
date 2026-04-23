"use client";
import Image from 'next/image';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserContextType {
    role: string | null;
    storeId: string | null;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
    role: null,
    storeId: null,
    isLoading: true
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<{ role: string | null; storeId: string | null }>({ 
        role: null, 
        storeId: null 
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getCookie = (name: string) => {
            if (typeof document === "undefined") return null;
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
            return null;
        };

        const role = getCookie('user_role');
        const storeId = getCookie('store_id');

        if (role || storeId) {
            setUser({ 
                role: role || null, 
                storeId: storeId || null 
            });
        }

        setTimeout(() => setIsLoading(false), 300);
    }, []);

    return (
        <UserContext.Provider value={{ ...user, isLoading }}>
            {isLoading ? <GlobalTableOSLoader /> : children}
        </UserContext.Provider>
    );
};

export const GlobalTableOSLoader = () => (
    <div className="flex h-screen w-screen flex-col items-center justify-center relative">
        <div className="relative bg-white rounded-full shadow-md shadow-black/25">
            <div className="h-12 w-12 animate-spin rounded-full border-2 p-2 border-transparent border-t-black rounded-y-full">
            </div>
            <Image 
                src="/assets/tableOS-logo.png" 
                alt="Logo" 
                width={25} 
                height={25} 
                className='absolute top-2.75 left-2.75' 
            />
        </div>
    </div>
);

export const useUser = () => useContext(UserContext);