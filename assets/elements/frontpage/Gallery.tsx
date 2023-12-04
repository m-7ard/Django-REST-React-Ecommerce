import React from 'react'
import { type BaseAd } from '../../Types'
import Ad from './Ad'

interface GalleryInterface {
    title: string
    initial: BaseAd[]
    isHighlight: boolean
}

export default function Gallery ({ title, initial, isHighlight }: GalleryInterface): React.ReactNode {
    return (
        <div className="frontpage__gallery prop prop--vertical">
            <div className="prop__header">
                <div className="prop__title">
                    {title}
                </div>
            </div>
            <hr className="app__divider" />
            <div className="prop__row" data-role='content'>
                {
                    initial != null
                        ? (
                            initial.map((data, i) => (
                                <Ad
                                    isHighlight={isHighlight}
                                    data={data}
                                    key={i}
                                />
                            ))
                        )
                        : (
                            <div className="prop__subtitle">
                                Nothing Here Yet
                            </div>
                        )
                }
                {
                    initial != null
                        ? (
                            initial.map((data, i) => (
                                <Ad
                                    isHighlight={isHighlight}
                                    data={data}
                                    key={i}
                                />
                            ))
                        )
                        : (
                            <div className="prop__subtitle">
                                Nothing Here Yet
                            </div>
                        )
                }
                {
                    initial != null
                        ? (
                            initial.map((data, i) => (
                                <Ad
                                    isHighlight={isHighlight}
                                    data={data}
                                    key={i}
                                />
                            ))
                        )
                        : (
                            <div className="prop__subtitle">
                                Nothing Here Yet
                            </div>
                        )
                }
            </div>
        </div>
    )
}
