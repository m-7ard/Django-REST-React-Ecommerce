import React from 'react';

export default function HighlightBox() {
    return (
        <div className="frontpage__highlight-box">
            <div className="frontpage__highlight-header">
                <div className="frontpage__highlight-title">
                    Popular
                </div>
                <div className="frontpage__highlight-link">
                    See All
                </div>
            </div>
            <hr className="frontpage__highlight-divider" />
            <div className="frontpage__highlight-item">
                <div className="frontpage__highlight-image" />
                <div className="frontpage__highlight-label frontpage__highlight-label--main">
                    Label
                </div>
                <div className="frontpage__highlight-label">
                    Some sort of info Some sort of info
                </div>
                <div className="frontpage__highlight-price">
                    100$
                </div>
            </div>
            <div className="frontpage__highlight-item">
                <div className="frontpage__highlight-image" />
                <div className="frontpage__highlight-label frontpage__highlight-label--main">
                    Label
                </div>
                <div className="frontpage__highlight-label">
                    Some sort of info Some sort of info
                </div>
                <div className="frontpage__highlight-price">
                    100$
                </div>
            </div>
            <div className="frontpage__highlight-item">
                <div className="frontpage__highlight-image" />
                <div className="frontpage__highlight-label frontpage__highlight-label--main">
                    Label
                </div>
                <div className="frontpage__highlight-label">
                    Some sort of info Some sort of info
                </div>
                <div className="frontpage__highlight-price">
                    100$
                </div>
            </div>
        </div>
    );
}
