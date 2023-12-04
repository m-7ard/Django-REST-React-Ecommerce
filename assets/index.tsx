import {
    createRoutesFromElements,
    createBrowserRouter,
    Route,
    RouterProvider
} from 'react-router-dom'

import React from 'react'
import ReactDOM from 'react-dom/client'

import App, { loader as appLoader } from './App'
import Frontpage, { loader as frontpageLoader } from './blocks/Frontpage'
import Register from './blocks/Register'
import Account, { loader as accountLoader } from './blocks/Account'
import Login from './blocks/Login'
import PostAd from './blocks/PostAd'
import AdPostConfirmation from './blocks/AdPostConfirmation'
import AdDetails, { loader as adDetailLoader } from './blocks/AdDetails'
import AdEdit from './blocks/AdEdit'
import AdEditConfirmation from './blocks/AdEditConfirmation'

window.addEventListener('load', () => {
    const rootNode = document.getElementById('root')
    if (rootNode == null) {
        return
    }
    const root = ReactDOM.createRoot(rootNode)
    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route
                path="/"
                element={<App />}
                loader={appLoader}
            >
                <Route index element={<Frontpage />} loader={frontpageLoader} />
                <Route
                    path="register/"
                    element={<Register />}
                />
                <Route
                    path="login/"
                    element={<Login />}
                />
                <Route
                    path="account/"
                    element={<Account />}
                    loader={accountLoader}
                />
                <Route
                    path="post-ad/"
                >
                    <Route index element={<PostAd />} />
                    <Route
                        path="success/"
                        element={<AdPostConfirmation />}
                    />
                </Route>
                <Route
                    path="ad/:pk/"
                >
                    <Route index element={<AdDetails />} loader={adDetailLoader} />
                    <Route
                        path="edit/"
                        element={<AdEdit />}
                        loader={adDetailLoader}
                    />
                    <Route
                        path="edit/success/"
                        element={<AdEditConfirmation />}
                    />
                </Route>
            </Route>
        )
    )

    root.render(
        <RouterProvider router={router} />
    )
})
