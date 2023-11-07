import React from 'react';
import AppHeader from './blocks/AppHeader';
import { Outlet } from "react-router-dom";


async function getBaseCategoryData() {
    const request = await fetch(URLS.BASE_CATEGORY);
    const baseCategoryData = await request.json();
    return baseCategoryData;
}


export async function loader() {
    const baseCategoryData = await getBaseCategoryData();
    return { baseCategoryData };
}

export default function App() {
    return (
        <div className="app">
            <AppHeader />
            <div className="app__body">
                <Outlet />
            </div>
            
        </div>
    );
};