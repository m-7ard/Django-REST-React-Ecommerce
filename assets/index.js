import _ from 'lodash';
import React from 'react';
import ReactDOM from "react-dom/client";
import App, { loader as appLoader } from "./App";  
import Frontpage from "./blocks/Frontpage";
import {
    createRoutesFromElements,
    createBrowserRouter,
    Route,
    RouterProvider,
} from "react-router-dom";


window.addEventListener('load', () => {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route
                path="/"
                element={<App />}
                loader={appLoader}
            >
                <Route index element={<Frontpage />} />

            </Route>
        )
    );

    root.render(
        <RouterProvider router={router} />
    );
});