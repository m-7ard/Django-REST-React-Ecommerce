import React, { createContext, useContext } from 'react'
import { type User, type CategoryData, type Category, SearchAdsInputs } from './Types'

interface UserContextInterface {
    setUser: (data: User) => void
    user: User
}

interface CategoryContextInterface {
    allCategories: Category[]
    baseCategory: Category
}

export interface SearchAdsContextInterface {
    setSearchAdsInputs: (data: SearchAdsInputs) => void
    searchAdsInputs?: SearchAdsInputs
}

export const UserContext = createContext<UserContextInterface | null>(null)
export const CategoryContext = createContext<CategoryData | null>(null)
export const SearchAdsContext = createContext<SearchAdsContextInterface | null>(null)

export const useUserContext = (): UserContextInterface => {
    const drawerContextValue = useContext(UserContext)

    if (drawerContextValue == null) {
        throw new Error(
            'useUserContext has to be used within <UserContext.Provider>'
        )
    }

    return drawerContextValue
}

export const useCategoryContext = (): CategoryContextInterface => {
    const categoryContextValue = useContext(CategoryContext)

    if (categoryContextValue == null) {
        throw new Error(
            'useCategoryContext has to be used within <CategoryContext.Provider>'
        )
    }

    return categoryContextValue
}

export const useSearchAdsContext = (): SearchAdsContextInterface => {
    const searchAdsContextValue = useContext(SearchAdsContext)

    if (searchAdsContextValue == null) {
        throw new Error(
            'useSearchAdsContext has to be used within <SearchAdsContext.Provider>'
        )
    }

    return searchAdsContextValue
}
