import {
    createRoutesFromElements,
    createBrowserRouter,
    Route,
    RouterProvider,
} from "react-router-dom";

import React from 'react';
import ReactDOM from "react-dom/client";

import App from "./App";  
import Frontpage from "./blocks/Frontpage";
import Register from './blocks/Register';
import Account from './blocks/Account';
import Login from './blocks/Login';
import PostAd from "./blocks/PostAd";
import AdConfirmation from "./blocks/AdConfirmation";
import AdDetails from "./blocks/AdDetails";
import { loader as appLoader } from "./App";
import { loader as adLoader } from "./blocks/AdDetails";


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
                >
                    
                </Route>   
                <Route 
                    path='post-ad/'
                >
                    <Route index element={<PostAd />} />
                    <Route 
                        path='success/'
                        element={<AdConfirmation />}
                    >
                    </Route>   
                </Route>   
                <Route 
                    path='ad/:pk/'
                >
                    <Route index element={<AdDetails />} loader={adLoader} />
                </Route>
            </Route>
        )
    );

    root.render(
        <RouterProvider router={router} />
    );
});