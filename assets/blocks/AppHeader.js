import React from 'react';
import CategorySearchbar from '../element_groups/CategorySearchbar';


export default function AppHeader() {
    return (
        <div className="app__header">
            <div className="app__header-section app__header-section--top">
                <div className="app__header-group">
                    <div className="app__header-link">
                        Contact & Help
                    </div>
                    <div className="app__header-link">
                        News
                    </div>
                </div>
                <div className="app__header-group">
                    <div className="app__icon">
                        <div className="icon icon--small icon--hoverable">
                            <i className="material-icons">
                                person
                            </i>
                        </div>
                    </div>
                    <div className="app__icon">
                        <div className="icon icon--small icon--hoverable">
                            <i className="material-icons">
                                shopping_cart
                            </i>
                        </div>
                    </div>
                </div>
            </div>
            <div className="app__header-section app__header-section--main">
                <CategorySearchbar />
            </div>
        </div>
    );
};