import React, { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { type BaseAd } from '../../Types'

interface AdProps {
    isHighlight: boolean
    data: BaseAd
}

export default function Ad ({ isHighlight, data }: AdProps): ReactNode {
    const {
        title, price, images, pk
    } = data

    if (isHighlight) {
        return (
            <Link to={`/ad/${pk}`} className="ad@frontpage ad@frontpage--featured">
                <div className="ad@frontpage__image">
                    <img src={`/media/${images[0]}`} alt="display" />
                </div>
                <div className="ad@frontpage__title">
                    {title}
                </div>
                <div className="ad@frontpage__pricetag">
                    {price}
                    €
                </div>
            </Link>
        )
    }

    return (
        <Link to={`/ad/${pk}`}>
            <div className="ad@frontpage ad@frontpage--normal">
                <div className="ad@frontpage__image">
                    <img src={`/media/${images[0]}`} alt="display" />
                </div>
                <div className='ad@frontpage__body'>
                    <div className="ad@frontpage__title">
                        {title}
                    </div>
                    <div className="ad@frontpage__price">
                        {price}
                        <span data-role='price-symbol'>
                            €
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
