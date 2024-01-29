import React, { useState } from 'react'
import { Link, useNavigate, type LoaderFunctionArgs } from 'react-router-dom'
import { type AdsPaginationResponseInterface, useAdPaginator } from '../../Pagination'
import Icon from '../../elements/Icon'
import { generatePageNumbers, getCookie } from '../../Utils'
import { type BaseAd } from '../../Types'

export async function loader ({ request }: LoaderFunctionArgs): Promise<{ adsPaginationResponse: AdsPaginationResponseInterface }> {
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const response = await fetch(`/api/list_user_bookmarks/?${searchParams.toString()}`)
    const adsPagination = await response.json()
    return { adsPaginationResponse: [adsPagination, response.ok] }
}

export default function Bookmarks (): React.ReactNode {
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

    const [results, setResults] = useState(adsPagination.results)
    const navigate = useNavigate()

    const removeFromBookmarks = async (ad: BaseAd): Promise<void> => {
        const csrfToken = getCookie('csrftoken')
        if (csrfToken == null) {
            return
        }

        const response = await fetch(`/api/ads/${ad.pk}/remove_from_bookmarks/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken
            }
        })
        if (response.ok) {
            setResults((previous) => previous.filter(({ pk }) => pk !== ad.pk))
        }
        else {
            navigate('/login/')
        }
    }

    return (
        <div className="prop prop--vertical pamphlet">
            <div className="prop__header">
                <div className="prop__title">
                    Bookmarks
                </div>
            </div>
            <hr className="app__divider" />
            <div className='prop__body'>
                {
                    results.map((ad, i) => (
                        <div className="prop prop--vertical prop--highlighted" key={i}>
                            <div className="prop__row">
                                <Link className="avatar avatar--large prop prop--highlighted" to={`/ad/${ad.pk}/`}>
                                    <img src={`/media/${ad.images?.[0]}`} />
                                </Link>
                                <div className="prop__column grow">
                                    <div className="prop__pairing">
                                        <div>
                                            <Link to={`/ad/${ad.pk}/`} className="prop__info is-link ad@cart__title">
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
                            <div className='prop__footer'>
                                <div className='prop__detail is-link' onClick={() => {
                                    void removeFromBookmarks(ad)
                                }}>
                                    Remove
                                </div>
                            </div>
                        </div>
                    ))
                }
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
        </div>
    )
}
