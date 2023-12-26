import { type CategoryData, type Category, type FrontPageData, type BaseAd, type Address, BankAccount } from './Types'

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

export async function getAdData (pk: number): Promise<BaseAd> {
    const response = await fetch(`/api/ads/${pk}`)
    const data = await response.json()
    return data
}

export async function getFrontpageData (): Promise<FrontPageData> {
    const response = await fetch('/api/frontpage_data/')
    const data = await response.json()
    return data
}

export async function getUserAds (pk: number): Promise<BaseAd[]> {
    const response = await fetch(`/api/list_user_ads/${pk}/`)
    const data = await response.json()
    return data
}

export async function getRequestUserAds (): Promise<BaseAd[]> {
    const response = await fetch('/api/list_user_ads/')
    const data = await response.json()
    return data
}

export async function getRequestUserAddresses (): Promise<Address[]> {
    const response = await fetch('/api/addresses/')
    const data = await response.json()
    return data
}

export async function getRequestUserBankAccounts (): Promise<BankAccount[]> {
    const response = await fetch('/api/bank-accounts/')
    const data = await response.json()
    return data
}
