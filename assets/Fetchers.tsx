import { type CategoryData, type Category, type FrontPageData, BaseAd } from './Types'

export async function getCategoryData (): Promise<CategoryData> {
    const response = await fetch('/api/categories/')
    const data: Category[] = await response.json()

    for (const category of data) {
        if (category.parent === null) {
            return {
                baseCategory: category,
                allCategories: data
            }
        }
    }

    throw new Error('No base category found.')
}

export async function getAdData (pk) {
    const response = await fetch(`/api/ads/${pk}`)
    const data = await response.json()
    return data
}

export async function getFrontpageData (): Promise<FrontPageData> {
    const response = await fetch('/frontpage_data/')
    const data = await response.json()
    return data
}

export async function getUserAds (pk) {
    const response = await fetch(`/api/list_user_ads/${pk}/`)
    const data = await response.json()
    return data
}

export async function getRequestUserAds (): Promise<BaseAd[]> {
    const response = await fetch('/api/list_user_ads/')
    const data = await response.json()
    return data
}
