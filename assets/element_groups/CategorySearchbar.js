import React from 'react';
import Select from '../elements/Select';

export default function CategorySearchbar({baseCategory, categories}) {
    return (
        <div className='app__header-search-bar'>
            <Select
                name={'category'}
                initial={baseCategory}
                options={categories}
                selectClassName={'app__header-category-select'}
            />
            <div className='app__header-search-widget'>
                <div className="app__header-search-field">
                    <div data-role="input">
                        <input type="text"/>
                    </div>
                </div>
                <div className="app__header-search-button">
                    <div className="icon icon--small">
                        <i className="material-icons">
                            search
                        </i>
                    </div>
                </div>
            </div>
        </div>
    );
};