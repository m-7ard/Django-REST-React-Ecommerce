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


window.addEventListener('load', () => {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route
                path='/'
                element={<App />}
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
                    element={<PostAd />}
                >
                    
                </Route>   

            </Route>
        )
    );

    root.render(
        <RouterProvider router={router} />
    );
});