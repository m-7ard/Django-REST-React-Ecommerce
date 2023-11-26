import React, { createContext, useEffect, useState } from 'react';
import AppHeader from './blocks/AppHeader';
import { Outlet, useLoaderData, useLocation } from "react-router-dom";
import { getCategoryData } from './Fetchers';


export const UserContext = createContext(null);
export const CategoryContext = createContext(null);


export async function loader() {
    const categoryData = await getCategoryData();
    return { ...categoryData };
}


export default function App() {
    const location = useLocation();
    const [user, setUser] = useState(null);
    const categoryData = useLoaderData();

    useEffect(() => {
        async function setRequestUser() {
            const response = await fetch('/api/user/');
            if (response.ok) {
                const requestUser = await response.json();
                setUser({...requestUser, is_authenticated: true});
            }
            else {
                setUser({is_authenticated: false});
            }
        }

        setRequestUser();
    }, [location]);


    return (user && categoryData) && (
        <div className="app">
            <CategoryContext.Provider value={categoryData}>
                <UserContext.Provider value={{ user: user, setUser: setUser }}>
                    <AppHeader />
                    <div className="app__body content-grid">
                        <Outlet />
                    </div>
                </UserContext.Provider>
            </CategoryContext.Provider>
        </div>
    );
};