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
