import {
    createRoutesFromElements,
    createBrowserRouter,
    Route,
    RouterProvider
} from 'react-router-dom'

import React from 'react'
import ReactDOM from 'react-dom/client'

import App, { loader as appLoader } from './App'
import Frontpage, { loader as frontpageLoader } from './blocks/Store/Frontpage'
import Register from './blocks/Auth/Register'
import Account, { loader as accountLoader } from './blocks/User/Account'
import Login from './blocks/Auth/Login'
import PostAd from './blocks/Ad/PostAd'
import AdPostConfirmation from './blocks/Ad/AdPostConfirmation'
import AdDetails, { loader as adDetailLoader } from './blocks/Ad/AdDetails'
import AdEdit from './blocks/Ad/AdEdit'
import AdEditConfirmation from './blocks/Ad/AdEditConfirmation'
import { LoginRequired } from './Utils'
import ManageFunds from './blocks/User/ManageFunds'
import Settings, { loader as settingsLoader } from './blocks/User/Settings'
import ManageBankAccounts from './blocks/BankAccount/ManageBankAccounts'
import CreateBankAccount, { loader as createBankAccountLoader } from './blocks/BankAccount/CreateBankAccount'
import ManageAddresses from './blocks/Address/ManageAddresses'
import { getRequestUserAddresses, getRequestUserBankAccounts, getRequestUserTransactions } from './Fetchers'
import CreateAddress from './blocks/Address/CreateAddress'
import WithdrawFunds from './blocks/User/WithdrawFunds'
import AdBoost from './blocks/Ad/AdBoost'
import SearchAds, { loader as searchAdsLoader } from './blocks/Store/SearchAds'
import Cart from './blocks/Store/Cart'

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
                    element={
                        <LoginRequired>
                            <Account />
                        </LoginRequired>
                    }
                    loader={accountLoader}
                />
                <Route
                    path='search/'
                    element={<SearchAds />}
                    loader={searchAdsLoader}
                />
                <Route
                    path='bank-accounts/'
                    element={
                        <LoginRequired>
                            <ManageBankAccounts />
                        </LoginRequired>
                    }
                    loader={async () => {
                        const data = await getRequestUserBankAccounts()
                        return data
                    }}
                />
                <Route
                    path='bank-accounts/add/'
                    element={
                        <LoginRequired>
                            <CreateBankAccount />
                        </LoginRequired>
                    }
                    loader={createBankAccountLoader}
                />
                <Route
                    path='addresses/'
                    element={
                        <LoginRequired>
                            <ManageAddresses />
                        </LoginRequired>
                    }
                    loader={async () => {
                        const data = await getRequestUserAddresses()
                        return data
                    }}
                />
                <Route
                    path='addresses/add/'
                    element={
                        <LoginRequired>
                            <CreateAddress />
                        </LoginRequired>
                    }
                    loader={async () => {
                        const data = await getRequestUserAddresses()
                        return data
                    }}
                />
                <Route
                    path='cart/'
                    element={ <Cart /> }
                />
                <Route
                    path='settings/'
                    element={
                        <LoginRequired>
                            <Settings />
                        </LoginRequired>
                    }
                    loader={settingsLoader}
                />
                <Route
                    path="funds/"
                    element={
                        <LoginRequired>
                            <ManageFunds />
                        </LoginRequired>
                    }
                    loader={async () => {
                        const transactions = await getRequestUserTransactions()
                        return { transactions }
                    }}
                />
                <Route
                    path="funds/withdraw/"
                    element={
                        <LoginRequired>
                            <WithdrawFunds />
                        </LoginRequired>
                    }
                    loader={async () => {
                        const bankAccounts = await getRequestUserBankAccounts()
                        return bankAccounts
                    }}
                />
                <Route
                    path="post-ad/"
                >
                    <Route index element={
                        <LoginRequired>
                            <PostAd />
                        </LoginRequired>
                    } />
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
                        element={
                            <LoginRequired>
                                <AdEdit />
                            </LoginRequired>
                        }
                        loader={adDetailLoader}
                    />
                    <Route
                        path="edit/success/"
                        element={<AdEditConfirmation />}
                    />
                    <Route
                        path="boost/"
                        element={
                            <LoginRequired>
                                <AdBoost />
                            </LoginRequired>
                        }
                    />
                </Route>
            </Route>
        )
    )

    root.render(
        <RouterProvider router={router} />
    )
})
