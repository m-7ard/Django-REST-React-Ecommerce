import React, { useEffect, useLayoutEffect, useState } from 'react'
import { Outlet, ScrollRestoration, useLoaderData, useLocation } from 'react-router-dom'
import AppHeader from './blocks/Store/AppHeader'
import { getCategoryData } from './Fetchers'
import { UserContext, CategoryContext, SearchAdsContext, CartContext } from './Context'
import { type SearchAdsInputs, type CategoryData, type User, type Cart } from './Types'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

export async function loader (): Promise<{ baseCategory: unknown, allCategories: unknown }> {
    const categoryData = await getCategoryData()
    return categoryData
}

export default function App (): React.ReactNode {
    const location = useLocation()
    const [user, setUser] = useState<User | null>(null)
    const categoryData = useLoaderData() as CategoryData
    const [cart, setCart] = useState<Cart | null>(null)

    useEffect(() => {
        async function setRequestUser (): Promise<void> {
            const response = await fetch('/api/user/')
            if (response.ok) {
                const { cart, ...requestUser } = await response.json()
                setUser({ is_authenticated: true, ...requestUser })
                setCart(cart)
            }
            else {
                const { cart } = await response.json()
                setUser({ is_authenticated: false })
                setCart(cart)
            }
        }

        void setRequestUser()
        document.documentElement.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant' // Optional if you want to skip the scrolling animation
        })
    }, [location, user?.is_authenticated])

    return (user != null && categoryData != null && cart != null) && (
        <>
            <ScrollRestoration />
            <div className="app">
                <DndProvider backend={HTML5Backend}>
                    <CategoryContext.Provider value={categoryData}>
                        <UserContext.Provider value={{ user, setUser }}>
                            <CartContext.Provider value={{ cart, setCart }}>
                                <AppHeader />
                                <div className="app__body content-grid">
                                    <Outlet />
                                </div>
                                <div className='app__footer prop'>
                                    {
                                        [1, 2, 3, 4, 5].map((_, i) => (
                                            <div className='prop prop--vertical' key={i}>
                                                <div className='prop__label'>
                                                    Site Info
                                                </div>
                                                <div className='prop__pairing'>
                                                    <div className='prop__detail'>
                                                        Lorem Ipsum
                                                    </div>
                                                    <div className='prop__detail'>
                                                        Lorem Ipsum
                                                    </div>
                                                    <div className='prop__detail'>
                                                        Lorem Ipsum
                                                    </div>
                                                    <div className='prop__detail'>
                                                        Lorem Ipsum
                                                    </div>

                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </CartContext.Provider>
                        </UserContext.Provider>
                    </CategoryContext.Provider>
                </DndProvider>
            </div>
        </>
    )
}
