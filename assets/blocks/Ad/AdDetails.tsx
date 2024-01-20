import React, { useState } from 'react'
import { useLoaderData } from 'react-router-dom'
import { getAdData } from '../../Fetchers'
import { useCartContext, useCategoryContext } from '../../Context'
import { NormalizedData, addDotsToNumber } from '../../Utils'
import { type BaseAd } from '../../Types'

export async function loader ({ params }: { params: { pk: number } }): Promise<BaseAd> {
    const ad = await getAdData(params.pk)
    return ad
}

function AmountController ({ ad }: { ad: BaseAd }): React.ReactNode {
    const soldOut = ad.available === 0
    const [amount, setAmount] = useState(soldOut ? 0 : 1)

    return (
        <div className='prop__row prop__row--centered'>
            <div className='prop__label'>
                Amount
            </div>
            <input defaultValue={amount} max={ad.available} className='ad-details__amount' type='number' />
            <div className='prop__detail'>
                {soldOut ? 'Sold Out' : `${ad.available} Available`}
            </div>
        </div>
    )
}

export default function AdDetails (): React.ReactNode {
    const ad = useLoaderData() as BaseAd
    const { allCategories } = useCategoryContext()
    const { cart, setCart } = useCartContext()
    const NormalizedCategories = new NormalizedData({
        data: allCategories,
        valueKey: 'pk',
        labelKey: 'name',
        parentKey: 'parent'
    })
    const addToCart = async (): Promise<void> => {
        const response = await fetch(`/api/ads/${ad.pk}/add_to_cart/`)
        if (response.status === 404) {
            return
        }

        const item = await response.json()
        setCart({ items: [...cart.items, item] })
    }

    const ImageDisplay = (): React.ReactNode => {
        const [current, setCurrent] = useState(ad.images[0])

        return (
            <div className='img-display@ad-details'>
                <div className='img-display@ad-details__picker'>
                    {
                        ad.images.map((filename, i) => (
                            <div className='img-display@ad-details__pickable' key={i} onMouseEnter={() => {
                                setCurrent(filename)
                            }}>
                                <img src={`/media/${filename}`} alt="pickable" />
                            </div>
                        ))
                    }
                </div>
                <div className='img-display@ad-details__current'>
                    <img src={`/media/${current}`} alt="current" />
                </div>
            </div>
        )
    }

    /*
    
        TODO: write a way to now filter by options on the details
    
    */

    return (
        <div className="ad-details prop">
            <div className="ad-details__header">
                <div className="ad-details__category">
                    {NormalizedCategories.getRouteString(ad.category)}
                </div>
            </div>
            <div className="ad-details__imagebox">
                <ImageDisplay />
            </div>
            <div className="ad-details__main">
                <div className="ad-details__main-header">
                    <div className="ad-details__title">
                        {ad.title}
                    </div>
                    <div className="ad-details__price">
                        {addDotsToNumber(ad.price)}
                        $
                    </div>
                </div>
                <div className="ad-details__seller">
                    <div className="app__avatar">
                        <div className="avatar avatar--small">
                            <img src={ad.created_by.avatar} alt="avatar" />
                        </div>
                    </div>
                    <div className="ad-details__seller-body">
                        <div className="ad-details__seller-title">
                            {ad.created_by.display_name}
                        </div>
                        <div className="ad-details__seller-footer">
                            <div className="ad-details__seller-label">
                                {ad.created_by.account_type === 'individual' ? 'Individual Seller' : 'Business Seller'}
                            </div>
                            <div className="ad-details__seller-link">
                                No Ratings
                            </div>
                            <div className="ad-details__seller-link">
                                Seller&apos;s Profile
                            </div>
                        </div>
                    </div>
                </div>
                <hr className="app__divider" />
                <AmountController ad={ad} />
                <div className="ad-details__button ad-details__button--yellow">
                    Buy Now
                </div>
                {
                    cart.items.find((item) => item.ad.pk === ad.pk) == null
                        ? (
                            <div className="ad-details__button ad-details__button--yellow" onClick={() => {
                                void addToCart()
                            }}>
                                Add to Cart
                            </div>
                        )
                        : (
                            <div className="ad-details__button ad-details__button--black">
                                See in Cart
                            </div>
                        )
                }
                <div className="ad-details__button ad-details__button--black">
                    Bookmark
                </div>
            </div>
            <div className="ad-details__footer">
                <div className="ad-details__label">
                    Description
                </div>
                <hr className="app__divider" />
                <div className="ad-details__description">
                    {ad.description}
                </div>
            </div>
        </div>
    )
}
