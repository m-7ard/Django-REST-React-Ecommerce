import React from 'react'
import { Link, useLoaderData } from 'react-router-dom'

import { getRequestUserAds } from '../../Fetchers'
import { useCategoryContext, useUserContext } from '../../Context'
import { type BaseAd } from '../../Types'

export async function loader (): Promise<BaseAd[]> {
    const ads = await getRequestUserAds()
    return ads
}

export default function Account (): React.ReactNode {
    const ads = useLoaderData() as BaseAd[]
    const { user } = useUserContext()
    const { allCategories } = useCategoryContext()

    return (
        <div className="account prop prop--vertical pamphlet">
            <div className='profile@account prop prop--vertical'>
                <div className='profile@account__main'>
                    <div className='profile@account__image'>
                        <img src={user.avatar ?? 'unknown.png'} />
                    </div>
                    <div className='prop__pairing'>
                        <div>
                            <div className='prop__title'>
                                {user.display_name}
                            </div>
                            <div className='prop__subtitle'>
                                {user.account_type === 'individual' ? 'Individual Seller' : 'Business Seller'}
                            </div>
                        </div>
                        <div className='prop__label'>
                            {ads.length} Ad/s Online
                        </div>
                        <div className='prop__row'>
                            <div className='prop__detail'>
                                Followers: 0
                            </div>
                            <div className='prop__detail'>
                                Following: 100
                            </div>
                        </div>
                        <div className='prop__subtitle'>
                            Date Registered: {user.date_joined}
                        </div>
                    </div>
                </div>
            </div>
            <div className="prop__header">
                <div className="prop__title">
                    Online Ads
                </div>
            </div>
            <hr className="app__divider" />
            <div className="prop__body">
                {
                    ads.map((ad, i) => (
                        <div className="ad@account prop prop--vertical" key={i}>
                            <div className="ad@account__main">
                                <Link className="ad@account__image" to={`/ad/${ad.pk}/`}>
                                    <img src={`/media/${ad.images?.[0]}`} />
                                </Link>
                                <div className="prop__column grow">
                                    <div className="prop__pairing">
                                        <div className="prop__subtitle">
                                            {allCategories.find((category) => category.pk === ad.category)?.name}
                                        </div>
                                        <Link className="prop__title" to={`/ad/${ad.pk}/`}>
                                            {ad.title}
                                        </Link>
                                        <div className="prop__info">
                                            {ad.price}
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
                                <Link className="ad@account__button" to={`/ad/${ad.pk}/boost/`}>
                                    Boost
                                    <div className="icon icon--small">
                                        <i className="material-icons">
                                            fast_forward
                                        </i>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}
