import React from 'react'
import { Link, useLoaderData } from 'react-router-dom'

import { addDotsToNumber, useLoginRequired } from '../Utils'
import { getRequestUserAds } from '../Fetchers'
import { useCategoryContext } from '../Context'
import { type BaseAd } from '../Types'

export async function loader ({ params }: { params: { pk: number } }): Promise<BaseAd[]> {
    const ads = await getRequestUserAds(params.pk)
    return ads
}

export default function Account (): React.ReactNode {
    useLoginRequired()
    const ads = useLoaderData() as BaseAd[]
    const { allCategories } = useCategoryContext()

    return (
        <div className="account prop prop--vertical pamphlet">
            <form className="prop__header" method="POST" action="/api/categories/1/">
                <div className="prop__title">
                    Account
                </div>
            </form>
            <hr className="app__divider" />
            <div className="prop__body">
                {ads.map((ad, i) => (
                    <div className="ad@account prop prop--vertical" key={i}>
                        <div className="ad@account__main">
                            <div className="ad@account__image">
                                <img src={`/media/${ad.images?.[0]}`} />
                            </div>
                            <div className="prop__column grow">
                                <div className="prop__pairing">
                                    <div className="prop__subtitle">
                                        {allCategories.find((category) => category.pk === ad.category)?.name}
                                    </div>
                                    <div className="prop__title">
                                        {ad.title}
                                    </div>
                                    <div className="prop__info">
                                        {addDotsToNumber(ad.price)}
                                        $
                                    </div>
                                    <div className="prop__detail">
                                        Expiry Date:
                                        {' '}
                                        {ad.expiry_date}
                                    </div>
                                    <div className="prop__row">
                                        <div className="prop__subtitle">
                                            100 Views
                                        </div>
                                        <div className="prop__subtitle">
                                            5 Bookmarks
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="ad@account__actions">
                            <Link to={`/ad/${ad.pk}/edit`}>
                                <div className="ad@account__button">
                                    Edit
                                    <div className="icon icon--small">
                                        <i className="material-icons">
                                            edit
                                        </i>
                                    </div>
                                </div>
                            </Link>
                            <div className="ad@account__button">
                                Unlist
                                <div className="icon icon--small">
                                    <i className="material-icons">
                                        flag
                                    </i>
                                </div>
                            </div>
                            <div className="ad@account__button">
                                Delete
                                <div className="icon icon--small">
                                    <i className="material-icons">
                                        delete
                                    </i>
                                </div>
                            </div>
                            <div className="ad@account__button">
                                Boost
                                <div className="icon icon--small">
                                    <i className="material-icons">
                                        fast_forward
                                    </i>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
