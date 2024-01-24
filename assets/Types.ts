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

export type NormalizedDataValue = number | string

export interface NormalizedDataItem {
    value: NormalizedDataValue
    label: string
    parent?: number
}

export interface UnnormalizedData {
    data: Array<Record<string, any>>
    valueKey: string
    labelKey: string
    parentKey?: string
}

export interface CartItem {
    ad: BaseAd
    amount: number
    pk: number
}

export interface Cart {
    items: CartItem[]
}

export interface User {
    is_authenticated: boolean
    [key: string]: any
}

export interface AdGroupAd {
    title: string
    specifications: Record<string, string>
    pk: number
}

export interface BaseAd {
    pk: number
    images: string[]
    category: number
    created_by: User
    title: string
    description: string
    price: number
    expiry_date: string
    highlight: boolean
    top: boolean
    gallery: boolean
    unlisted: boolean
    available: number
    shipping: number
    condition?: 'new' | 'used' | 'almost_new' | 'damaged'
    return_policy: '7_days' | '30_days' | 'warranty'
    specifications_json: Record<string, string>
    group: number
    group_data?: AdGroup
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
    country_display: string
}

export interface BankAccount {
    pk: number
    user: number
    owner: string
    address: Address
    iban: string
    is_default: boolean
}

export interface Transaction {
    label: string
    signed_amount: number
    subkind: string
    date: string
}

export interface SearchAdsInputs {
    q?: string
    min_price?: number
    max_price?: number
    [key: string]: string | number | File | undefined
}

export interface AdGroup {
    name: string
    options: Record<string, string[]>
    pk: number
    ads: AdGroupAd[]
}
