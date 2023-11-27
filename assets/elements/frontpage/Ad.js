import React from "react";
import { addDotsToNumber } from "../../Utils";



export default function Ad({isHighlight, data}) {
    if (!data) {
        return
    }
    const { title, price, images } = data;
    console.log(title, price, images)
    
    if (isHighlight) {
        return (
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
        )
    }
    else {
        return (
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
        )
    }

}