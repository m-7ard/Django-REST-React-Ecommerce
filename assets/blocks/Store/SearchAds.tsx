import React from 'react'
import { type LoaderFunctionArgs, useLoaderData, useSearchParams } from 'react-router-dom'
import { type BaseAd } from '../../Types'
import { addDotsToNumber } from '../../Utils'
import SearchFilterMenu from '../../elements/SearchFilterMenu'
import Icon from '../../elements/Icon'

export async function loader ({ request }: LoaderFunctionArgs): Promise<BaseAd[]> {
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const response = await fetch(`/api/ads/search/?${searchParams.toString()}`)
    const adSearch = await response.json()
    return [adSearch, response.ok]
}

function generatePageNumbers (currentPage: number, totalPages: number): number[] {
    const maxVisiblePages = 10
    const pages = []

    // Ensure maxVisiblePages is an odd number for symmetric display
    const halfMaxVisiblePages = Math.floor(maxVisiblePages / 2)

    // Calculate the range of page numbers to display
    let startPage = Math.max(currentPage - halfMaxVisiblePages, 1)
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages)

    // Adjust the startPage if the endPage is at the maximum limit
    startPage = Math.max(endPage - maxVisiblePages + 1, 1)

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
    }

    return pages
}

export default function SearchAds (): React.ReactNode {
    const [searchParams, setSearchParams] = useSearchParams()
    const pageParam = searchParams.get('page')
    const page: number = pageParam != null ? parseInt(pageParam) : 1

    const pageSizeParam = searchParams.get('page_size')
    const pageSize: number = pageSizeParam != null ? parseInt(pageSizeParam) : 25
    const [adSearch, success] = useLoaderData() as [
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

    if (!success) {
        return (
            <div className="prop prop--vertical">
                <div className='prop prop--vertical prop--highlighted'>
                    <div className='prop__detail'>
                        {adSearch.detail}
                    </div>
                </div>
            </div>
        )
    }

    const totalPageNumber = Math.ceil(adSearch.count / pageSize)
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

    return (
        <div className="search prop pamphlet">
            <div className='search__mobile-header'>
                <div className='search__mobile-section'>
                    <div className='prop__label is-link'>
                        {adSearch.count} Search Results
                    </div>
                    <div className="prop__row">
                        <div className='prop__label is-link'>
                            Sort
                        </div>
                        <SearchFilterMenu />
                    </div>
                </div>
            </div>
            <div className='prop prop--vertical'>
                <div className='search__page-select'>
                    <div className={`search__page-button ${adSearch.previous == null ? 'search__page-button--disabled' : ''}`} onClick={() => {
                        adSearch.previous != null && changePage(page - 1)
                    }}>
                        <Icon name='keyboard_arrow_left' size='small' />
                    </div>
                    {
                        generatePageNumbers(page, totalPageNumber).map((n) => {
                            const pageParams = new URLSearchParams(searchParams)
                            pageParams.set('page', n.toString())

                            return (
                                <div className={`search__page-button ${page === n ? 'search__page-button--selected' : ''}`} onClick={() => {
                                    changePage(n)
                                }} key={n}>
                                    {n}
                                </div>
                            )
                        })
                    }
                    <div className={`search__page-button ${adSearch.next == null ? 'search__page-button--disabled' : ''}`} onClick={() => {
                        adSearch.next != null && changePage(page + 1)
                    }}>
                        <Icon name='keyboard_arrow_right' size='small' />
                    </div>
                </div>
            </div>
            <div className='prop prop--vertical'>
                {
                    adSearch.results.map((ad, i) => (
                        <div className="ad@search prop prop--vertical" key={i}>
                            <div className="ad@search__main">
                                <div className="ad@search__image">
                                    <img src={`/media/${ad.images?.[0]}`} />
                                </div>
                                <div className="prop__column grow">
                                    <div className="prop__pairing">
                                        <div>
                                            <div className="ad@search__title">
                                                {ad.title}
                                            </div>
                                            {
                                                ad.condition != null && (
                                                    <div className="ad@search__subtitle">
                                                        {ad.condition}
                                                    </div>
                                                )
                                            }
                                        </div>
                                        <div className="ad@search__price">
                                            {addDotsToNumber(ad.price)}
                                            $
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>

        </div>
    )
}
