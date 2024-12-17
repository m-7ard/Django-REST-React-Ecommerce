import React from 'react'
import { type BaseAd } from '../../Types'
import Ad from './Ad'

interface GalleryInterface {
    title: string
    ads: BaseAd[] | null
    isHighlight: boolean
}

export default function Gallery ({ title, ads, isHighlight }: GalleryInterface): React.ReactNode {
    return (
        <div className="prop prop--vertical gallery@frontpage">
            <div className="prop__header">
                <div className="prop__title prop__title--small">
                    {title}
                </div>
            </div>
            <hr className="app__divider" />
            <div className="prop__row gallery@frontpage__ads">
                {
                    ads != null
                        ? (
                            ads.map((data, i) => (
                                <Ad
                                    isHighlight={isHighlight}
                                    data={data}
                                    key={i}
                                />
                            ))
                        )
                        : (
                            <div className="prop__info">
                                Nothing Here Yet
                            </div>
                        )
                }
            </div>
        </div>
    )
}
