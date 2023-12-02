import React, { createContext } from 'react'
import { type CategoryData } from './Types'

export const UserContext = createContext(null)
export const CategoryContext = createContext<CategoryData | null>(null)
