import React, { createContext, useEffect, useState } from 'react';
import AppHeader from './blocks/AppHeader';
import { Outlet, useLocation } from "react-router-dom";


export const UserContext = createContext(null);
export const CategoryContext = createContext(null);


export default function App() {
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [categoryData, setCategoryData] = useState(null);

    useEffect(() => {
        async function getBaseCategory() {
            const response = await fetch("/api/categories/");
            const data = await response.json();
            
            for (let category of data) {
                if (!category.parent) {
                    setCategoryData({
                        baseCategory: category,
                        allCategories: data,
                    })
                    break
                }
            };
        };

        getBaseCategory();
    }, []);

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
                    <div className="app__body">
                        <Outlet />
                    </div>
                </UserContext.Provider>
            </CategoryContext.Provider>
                
        </div>
    );
};