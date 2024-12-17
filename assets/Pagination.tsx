import React, { SetStateAction } from 'react'
import { type SetURLSearchParams, useLoaderData, useSearchParams } from 'react-router-dom'
import { type BaseAd } from './Types'

type AdPaginationPageSizes = [25, 50, 75, 100]

interface SuccessfulPagination {
    success: true
    data: {
        adsPagination: {
            count: number
            next: string | null
            previous: string | null
            results: BaseAd[]
        }
        searchParams: URLSearchParams
        setSearchParams: SetURLSearchParams
        currentPage: number
        totalPages: number
        changePage: (n: number) => void
        changeMaxPageSize: (n: 25 | 50 | 75 | 100) => void
        pageSize: number
        validPageSizes: AdPaginationPageSizes
    }
}

interface FailedPagination {
    success: false
    data: {
        adsPagination: {
            detail: string
        }
    }
}

export type AdsPaginationResponseInterface = [
    {
        count: number
        next: string | null
        previous: string | null
        results: BaseAd[]
    },
    true
] | [
    {
        detail: string
    },
    false
]

export const useAdPaginator = (): SuccessfulPagination | FailedPagination => {
    const { adsPaginationResponse } = useLoaderData() as { adsPaginationResponse: AdsPaginationResponseInterface }
    const [adsPagination, success] = adsPaginationResponse

    if (!success) {
        return {
            success,
            data: {
                adsPagination
            }
        }
    }

    const validPageSizes: AdPaginationPageSizes = [25, 50, 75, 100]
    const [searchParams, setSearchParams] = useSearchParams()
    const pageParam = searchParams.get('page')
    const currentPage: number = (
        pageParam == null
    )
        ? 1
        : parseInt(pageParam)

    const pageSizeParam = searchParams.get('page_size')
    const pageSize: number = (
        pageSizeParam == null ||
        !validPageSizes.includes(parseInt(pageSizeParam))
    )
        ? 25
        : parseInt(pageSizeParam)

    const totalPages = Math.ceil(adsPagination.count / pageSize)
    const changePage = (n: number): void => {
        setSearchParams((prevSearchParams) => {
            const newParams = new URLSearchParams()
            prevSearchParams.forEach((value, key) => {
                newParams.set(key, value)
            })
            newParams.set('page', n.toString())
            return newParams
        })
    }

    const changeMaxPageSize = (n: 25 | 50 | 75 | 100): void => {
        setSearchParams((prevSearchParams) => {
            const newParams = new URLSearchParams()
            prevSearchParams.forEach((value, key) => {
                if (!(key === 'page')) {
                    newParams.set(key, value)
                }
            })
            newParams.set('page_size', n.toString())
            return newParams
        })
    }

    return {
        success,
        data: {
            adsPagination,
            searchParams,
            setSearchParams,
            currentPage,
            totalPages,
            changePage,
            pageSize,
            changeMaxPageSize,
            validPageSizes
        }
    }
}
