export interface HTMLEvent extends Event {
    target: HTMLElement
}

export interface Category {
    pk: number
    name: string
    parent?: string
}

export interface CategoryData {
    baseCategory: Category
    allCategories: Category[]
}

export interface NormalizedDataItem {
    value: number
    label: string
    parent?: number
}

export interface UnnormalizedData {
    data: Array<Record<string, any>>
    valueKey: string
    labelKey: string
    parentKey?: string
}

export interface User {
    is_authenticated: boolean
    [key: string]: any
}

export interface BaseAd {
    pk: number
    images: string[]
    category: number
    created_by: User
    description: string
    price: number
    expiry_date: string
    title: string
    [key: string]: unknown
}

export interface HighlightAd extends BaseAd {
    highlight: true
}

export interface FrontPageData {
    HIGHLIGHT_ADS: HighlightAd[] | null
    RECENT_ADS: BaseAd[] | null
}

export interface FormError {
    name: string
    msg: string
}

export interface Address {
    pk: number
    name: string
    street: string
    locality: string
    zip_code: number
    country: string
}
