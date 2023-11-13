import React from "react";



export default function Ad({featured}) {
    
    if (featured) {
        return (
            <div className='frontpage__ad frontpage__ad--featured'>
                <div className='frontpage__ad-image'>

                </div>
                <div className='frontpage__ad-title'>
                    Blank Ad
                </div>
                <div className='frontpage__ad-pricetag'>
                    1.199.950$
                </div>
            </div>
        )
    }
    else {
        return (
            <div className='frontpage__ad frontpage__ad--normal'>
                <div className='frontpage__ad-image'>
    
                </div>
                <div>
                    <div className='frontpage__ad-title'>
                        Blank Ad
                    </div>
                    <div className='frontpage__ad-price'>
                        100$
                    </div>
                </div>
            </div>
        )
    }

}