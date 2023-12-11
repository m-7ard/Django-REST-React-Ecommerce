import React from 'react'
import HighlightBox from '../elements/frontpage/HighlightBox'
import Gallery from '../elements/frontpage/Gallery'
import Ad from '../elements/frontpage/Ad'
import { getFrontpageData } from '../Fetchers'
import { useLoaderData } from 'react-router-dom'
import { type FrontPageData } from '../Types'

export async function loader (): Promise<FrontPageData> {
    const data = await getFrontpageData()
    return data
}

export default function Frontpage (): React.ReactNode {
    const { HIGHLIGHT_ADS, RECENT_ADS } = useLoaderData() as FrontPageData

    return (
        <div className='frontpage'>
            <Gallery title={'Featured Ads'} ads={HIGHLIGHT_ADS} isHighlight={true} />
            <div className='frontpage__highlight'>
                <HighlightBox />
                <HighlightBox />
            </div>
            <Gallery title={'Recommended'} ads={RECENT_ADS} isHighlight={false} />
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
                    {
                        RECENT_ADS?.map((data, i) => {
                            return (
                                <Ad isHighlight={false} data={data} key={i} />
                            )
                        })
                    }
                </div>
            </div>
            <div className='frontpage__highlight'>
                <HighlightBox />
                <HighlightBox />
            </div>
        </div>
    )
}
