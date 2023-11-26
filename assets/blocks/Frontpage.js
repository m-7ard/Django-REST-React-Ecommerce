import React from 'react';
import HighlightBox from '../elements/frontpage/HighlightBox';
import Gallery from '../elements/frontpage/Gallery';
import Ad from '../elements/frontpage/Ad';


export async function loader() {
    
}


export default function Frontpage() {
    return (
        <div className='frontpage'>
            <Gallery title={'Featured Ads'} />
            <div className='frontpage__highlight'>
                <HighlightBox />
                <HighlightBox />
            </div>
            <Gallery title={'Recommended'} />

            <div className='frontpage__main'>
                <div className='frontpage__header'>
                    <div className='frontpage__title'>
                        Recently Pushlished Ads
                    </div>
                    <div className='frontpage__link'>
                        See All
                    </div>
                </div>
                <div className='frontpage__recent-ads'>
                    {[1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7].map(() => {
                        return (
                            <Ad />
                        )
                    })}  
                </div>              
            </div>
            <div className='frontpage__highlight'>
                <HighlightBox />
                <HighlightBox />
            </div>
        </div>
    )
}