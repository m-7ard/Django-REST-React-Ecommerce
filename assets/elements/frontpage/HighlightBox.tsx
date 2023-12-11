import React from 'react'

export default function HighlightBox (): React.ReactNode {
    return (
        <div className="prop prop--vertical highlight@frontpage">
            <div className="prop__header">
                <div className="prop__title prop__title--small">
                    Popular
                </div>
                <div className="prop__detail">
                    See All
                </div>
            </div>
            <hr className="app__divider" />
            <div className="prop__row highlight@frontpage__item">
                <div className="highlight@frontpage__image" />
                <div>
                    <div className="prop__label">
                        Label
                    </div>
                    <div className="prop__detail">
                        Some sort of info Some sort of info
                    </div>
                    <div className="prop__detail highlight@frontpage__price">
                        100$
                    </div>
                </div>
            </div>
            <div className="prop__row highlight@frontpage__item">
                <div className="highlight@frontpage__image" />
                <div>
                    <div className="prop__label">
                        Label
                    </div>
                    <div className="prop__detail">
                        Some sort of info Some sort of info
                    </div>
                    <div className="prop__detail highlight@frontpage__price">
                        100$
                    </div>
                </div>
            </div>
            <div className="prop__row highlight@frontpage__item">
                <div className="highlight@frontpage__image" />
                <div>
                    <div className="prop__label">
                        Label
                    </div>
                    <div className="prop__detail">
                        Some sort of info Some sort of info
                    </div>
                    <div className="prop__detail highlight@frontpage__price">
                        100$
                    </div>
                </div>
            </div>
        </div>
    )
}
