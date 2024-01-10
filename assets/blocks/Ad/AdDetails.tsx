import React from 'react'
import { type LoaderFunctionArgs, useLoaderData } from 'react-router-dom'
import { getAdData } from '../../Fetchers'
import { useCategoryContext } from '../../Context'
import { NormalizedData, addDotsToNumber } from '../../Utils'
import { type BaseAd } from '../../Types'

export async function loader ({ params }: { params: { pk: number } }): Promise<BaseAd> {
    const ad = await getAdData(params.pk)
    return ad
}

export default function AdDetails (): React.ReactNode {
    const ad = useLoaderData() as BaseAd
    const { allCategories } = useCategoryContext()
    const NormalizedCategories = new NormalizedData({
        data: allCategories,
        valueKey: 'pk',
        labelKey: 'name',
        parentKey: 'parent'
    })

    return (
        <div className="ad@ad-details">
            <div className="ad@ad-details__header">
                <div className="ad@ad-details__category">
                    {NormalizedCategories.getRouteString(ad.category)}
                </div>
            </div>
            <div className="ad@ad-details__imagebox">
                <div data-role="image-picker">
                    {ad.images.map((filename, i) => (
                        <div data-role="select-image" key={i}>
                            <img src={`/media/${filename}`} alt="select" />
                        </div>
                    ))}
                </div>
                <div data-role="active-image">
                    <img src={`/media/${ad.images[0]}`} alt="active" />
                </div>
            </div>
            <div className="ad@ad-details__main">
                <div className="ad@ad-details__main-header">
                    <div className="ad@ad-details__title">
                        {ad.title}
                    </div>
                    <div className="ad@ad-details__price">
                        {addDotsToNumber(ad.price)}
                        $
                    </div>
                </div>
                <div className="ad@ad-details__seller">
                    <div className="app__avatar">
                        <div className="avatar avatar--small">
                            <img src={ad.created_by.avatar} alt="avatar" />
                        </div>
                    </div>
                    <div className="ad@ad-details__seller-body">
                        <div className="ad@ad-details__seller-title">
                            {ad.created_by.display_name}
                        </div>
                        <div className="ad@ad-details__seller-footer">
                            <div className="ad@ad-details__seller-label">
                                {ad.created_by.account_type === 'individual' ? 'Individual Seller' : 'Business Seller'}
                            </div>
                            <div className="ad@ad-details__seller-link">
                                No Ratings
                            </div>
                            <div className="ad@ad-details__seller-link">
                                Seller&apos;s Profile
                            </div>
                        </div>
                    </div>
                </div>
                <hr className="app__divider" />
                <div className="ad@ad-details__button ad@ad-details__button--yellow">
                    Buy Now
                </div>
                <div className="ad@ad-details__button ad@ad-details__button--yellow">
                    Add to Cart
                </div>
                <div className="ad@ad-details__button ad@ad-details__button--black">
                    Bookmark
                </div>
            </div>
            <div className="ad@ad-details__footer">
                <div className="ad@ad-details__label">
                    Description
                </div>
                <hr className="app__divider" />
                <div className="ad@ad-details__description">
                    {ad.description}
                </div>
            </div>
        </div>
    )
}
