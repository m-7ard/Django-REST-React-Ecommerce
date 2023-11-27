import React from "react";
import { addDotsToNumber } from "../../Utils";
import { Link } from "react-router-dom";



export default function Ad({isHighlight, data}) {
    if (!data) {
        // should be used for debugging purposes only
        return
    }
    const { title, price, images, pk } = data;
    
    if (isHighlight) {
        return (
            <Link to={`/ad/${pk}`}>
                <div className='frontpage__ad frontpage__ad--featured'>
                    <div className='frontpage__ad-image'>
                        <img src={`/media/${images[0]}`} />
                    </div>
                    <div className='frontpage__ad-title'>
                        {title}
                    </div>
                    <div className='frontpage__ad-pricetag'>
                        {addDotsToNumber(price)}$
                    </div>
                </div>
            </Link>
        )
    }
    else {
        return (
            <Link to={`/ad/${pk}`}>
                <div className='frontpage__ad frontpage__ad--normal'>
                    <div className='frontpage__ad-image'>
                        <img src={`/media/${images[0]}`} />
                    </div>
                    <div>
                        <div className='frontpage__ad-title'>
                            {title}
                        </div>
                        <div className='frontpage__ad-price'>
                            {addDotsToNumber(price)}$
                        </div>
                    </div>
                </div>
            </Link>
        )
    }

}