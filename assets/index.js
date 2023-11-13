import {
    createRoutesFromElements,
    createBrowserRouter,
    Route,
    RouterProvider,
} from "react-router-dom";

import React from 'react';
import ReactDOM from "react-dom/client";

import App, { loader as appLoader } from "./App";  
import Frontpage from "./blocks/Frontpage";
import Register from './blocks/Register';
import Account from './blocks/Account';
import Login from './blocks/Login';


window.addEventListener('load', () => {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route
                path='/'
                element={<App />}
                loader={appLoader}
            >
                <Route index element={<Frontpage />} />
                <Route 
                    path='register/'
                    element={<Register />}
                >

                </Route>
                <Route 
                    path='login/'
                    element={<Login />}
                >

                </Route>
                <Route 
                    path='account/'
                    element={<Account />}
                    loader={appLoader}
                >
                    
                </Route>   

            </Route>
        )
    );

    root.render(
        <RouterProvider router={router} />
    );
});