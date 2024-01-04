import React from 'react'
import { type LoaderFunctionArgs, useLoaderData, useLocation } from 'react-router-dom'
import { type BaseAd } from '../../Types'
import { addDotsToNumber } from '../../Utils'

export async function loader ({ request }: LoaderFunctionArgs): Promise<BaseAd[]> {
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const response = await fetch(`/api/ads/search/?${searchParams.toString()}`)
    const ads = await response.json()
    return ads
}

export default function SearchAds (): React.ReactNode {
    const search = useLocation().search
    const { q } = Object.fromEntries(new URLSearchParams(search))
    const ads = useLoaderData() as BaseAd[]
    console.log(ads)

    return (
        <div className="search prop">
            <div className='search__mobile-header'>
                <div className='search__mobile-section'>
                    <div className='prop__label is-link'>
                        {ads.length} Search Results
                    </div>
                    <div className="prop__row">
                        <div className='prop__label is-link'>
                            Sort
                        </div>
                        <div className='prop__label is-link'>
                            Filter
                        </div>
                    </div>
                </div>
            </div>
            <div className='prop prop--vertical'>
                {
                    ads.map((ad, i) => (
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
