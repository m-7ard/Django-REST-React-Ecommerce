export interface HTMLEvent extends Event {
    target: HTMLElement
}

export interface Category {
    pk: number
    name: string
    parent: number | null
}

export interface CategoryData {
    baseCategory: Category
    allCategories: Category[]
}

export interface NormalizedDataItem {
    value: number
    label: string
    parent: number
}

export interface UnnormalizedData {
    data: Array<Record<string, any>>
    valueKey: string
    labelKey: string
    parentKey: string
}

export interface User {
    is_authenticated: boolean
    [key: string]: any
}

export interface BaseAd {
    pk: number
    [key: string]: unknown
}

export interface HighlightAd extends BaseAd {
    highlight: true
}

export interface FrontPageData {
    HIGHTLIGHT_ADS: HighlightAd[] | null
    RECENT_ADS: BaseAd[] | null
}