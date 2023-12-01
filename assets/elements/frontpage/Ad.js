import React from 'react';
import { Link } from 'react-router-dom';
import { addDotsToNumber } from '../../Utils';

export default function Ad({ isHighlight, data }) {
    const {
        title, price, images, pk,
    } = data;

    if (isHighlight) {
        return (
            <Link to={`/ad/${pk}`}>
                <div className="frontpage__ad frontpage__ad--featured">
                    <div className="frontpage__ad-image">
                        <img src={`/media/${images[0]}`} alt="display" />
                    </div>
                    <div className="frontpage__ad-title">
                        {title}
                    </div>
                    <div className="frontpage__ad-pricetag">
                        {addDotsToNumber(price)}
                        $
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link to={`/ad/${pk}`}>
            <div className="frontpage__ad frontpage__ad--normal">
                <div className="frontpage__ad-image">
                    <img src={`/media/${images[0]}`} alt="display" />
                </div>
                <div>
                    <div className="frontpage__ad-title">
                        {title}
                    </div>
                    <div className="frontpage__ad-price">
                        {addDotsToNumber(price)}
                        $
                    </div>
                </div>
            </div>
        </Link>
    );
}
