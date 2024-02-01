import React from 'react'
import { type LoaderFunctionArgs, Link } from 'react-router-dom'
import { addDotsToNumber, generatePageNumbers } from '../../Utils'
import SearchFilterMenu from '../../elements/SearchFilterMenu'
import Icon from '../../elements/Icon'
import { type AdsPaginationResponseInterface, useAdPaginator } from '../../Pagination'

export async function loader ({ request }: LoaderFunctionArgs): Promise<{ adsPaginationResponse: AdsPaginationResponseInterface }> {
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const response = await fetch(`/api/ads/search/?${searchParams.toString()}`)
    const adsPagination = await response.json()
    return { adsPaginationResponse: [adsPagination, response.ok] }
}

export default function SearchAds (): React.ReactNode {
    const { success, data } = useAdPaginator()
    if (!success) {
        const { adsPagination } = data
        return (
            <div className="prop prop--vertical">
                <div className='prop prop--vertical prop--highlighted'>
                    <div className='prop__detail'>
                        {adsPagination.detail}
                    </div>
                </div>
            </div>
        )
    }

    const {
        adsPagination,
        currentPage,
        totalPages,
        changePage,
        changeMaxPageSize,
        validPageSizes,
        pageSize
    } = data

    return (
        <div className="search prop pamphlet">
            <div className='search__mobile-header'>
                <div className='search__mobile-section'>
                    <div className='prop__label is-link'>
                        {adsPagination.count} Search Results
                    </div>
                    <div className="prop__row">
                        <div className='prop__label is-link'>
                            Sort
                        </div>
                        <SearchFilterMenu />
                    </div>
                </div>
            </div>
            <div className='prop prop--vertical pagination'>
                <div className='pagination__select'>
                    <div className={`pagination__button ${adsPagination.previous == null ? 'pagination__button--disabled' : ''}`} onClick={() => {
                        adsPagination.previous != null && changePage(currentPage - 1)
                    }}>
                        <Icon name='keyboard_arrow_left' size='small' />
                    </div>
                    {
                        generatePageNumbers({ currentPage, totalPages }).map((n) => {
                            return (
                                <div className={`pagination__button ${currentPage === n ? 'pagination__button--selected' : ''}`} key={n} onClick={() => {
                                    changePage(n)
                                }}>
                                    {n}
                                </div>
                            )
                        })
                    }
                    <div className={`pagination__button ${adsPagination.next == null ? 'pagination__button--disabled' : ''}`} onClick={() => {
                        adsPagination.next != null && changePage(currentPage + 1)
                    }}>
                        <Icon name='keyboard_arrow_right' size='small' />
                    </div>
                </div>
                <div className='pagination__sizes'>
                    {
                        validPageSizes.map((n, i) => {
                            return (
                                <div className={`pagination__size ${n === pageSize ? 'pagination__size--selected' : ''}`} key={i} onClick={() => {
                                    changeMaxPageSize((n))
                                }}>
                                    {n}
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <div className='prop__body'>
                {
                    adsPagination.results.map((ad, i) => (
                        <div className="ad@search prop prop--vertical prop--highlighted" key={i}>
                            <div className="ad@search__main">
                                <Link className="ad@search__image" to={`/ad/${ad.pk}/`} onClick= {() => window.scrollTo(0, 0)}>
                                    <img src={`/media/${ad.images?.[0]}`} />
                                </Link>
                                <div className="prop__column grow">
                                    <div className="prop__pairing">
                                        <div>
                                            <Link to={`/ad/${ad.pk}/`} className="prop__info is-link ad@cart__title" onClick= {() => window.scrollTo(0, 0)}>
                                                {ad.title}
                                            </Link>
                                            {
                                                ad.condition != null && (
                                                    <div className='prop__detail'>
                                                        {ad.condition}
                                                    </div>
                                                )
                                            }
                                        </div>
                                        <div className='prop__row prop__row--centered'>
                                            <div className='prop__detail'>
                                                Price
                                            </div>
                                            <div className='prop__label'>
                                                {ad.price}€
                                            </div>
                                        </div>
                                        <div className='prop__detail'>
                                            {ad.shipping === 0 ? 'Free Shipping' : `+${ad.shipping}€ Shipping`}
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
