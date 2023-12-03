import React, { useEffect, useState } from 'react'
import { Outlet, useLoaderData, useLocation } from 'react-router-dom'
import AppHeader from './blocks/AppHeader'
import { getCategoryData } from './Fetchers'
import { UserContext, CategoryContext } from './Context'

export async function loader (): Promise<{ baseCategory: unknown, allCategories: unknown }> {
    const categoryData = await getCategoryData()
    return categoryData
}

export default function App (): React.ReactNode {
    const location = useLocation()
    const [user, setUser] = useState<Record<string, unknown> | null>(null)
    const categoryData = useLoaderData()

    useEffect(() => {
        async function setRequestUser (): Promise<void> {
            const response = await fetch('/api/user/')
            if (response.ok) {
                const requestUser = await response.json()
                setUser({ ...requestUser, is_authenticated: true })
            }
            else {
                setUser({ is_authenticated: false })
            }
        }

        void setRequestUser()
    }, [location])

    return (user != null && categoryData != null) && (
        <div className="app">
            <CategoryContext.Provider value={categoryData}>
                <UserContext.Provider value={{ user, setUser }}>
                    <AppHeader />
                    <div className="app__body content-grid">
                        <Outlet />
                    </div>
                </UserContext.Provider>
            </CategoryContext.Provider>
        </div>
    )
}
