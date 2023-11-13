import React, { createContext, useEffect, useState } from 'react';
import AppHeader from './blocks/AppHeader';
import { Outlet, useNavigate } from "react-router-dom";


async function getBaseCategoryData() {
    const request = await fetch(URLS.BASE_CATEGORY);
    const baseCategoryData = await request.json();
    return baseCategoryData;
}


export async function loader() {
    const baseCategoryData = await getBaseCategoryData();

    return { 
        baseCategoryData: baseCategoryData, 
    };
}


export const UserContext = createContext(null);
export const NextPageContext = createContext('/');


export default function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function getRequestUser() {
            const response = await fetch('/api/user/');
            const requestUser = await response.json();
            if (response.ok) {
                setUser(requestUser);
            }
            else {
                setUser(null);
            }
        }

        getRequestUser();
    }, []);
    
    return (
        <div className="app">
            <NextPageContext.Provider>
                <UserContext.Provider value={{ user: user, setUser: setUser }}>
                    <AppHeader />
                    <div className="app__body">
                        <Outlet />
                    </div>
                </UserContext.Provider>
            </NextPageContext.Provider>
        </div>
    );
};