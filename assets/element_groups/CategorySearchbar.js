import Select from '../elements/Select';
import React, {useState, useEffect, useContext} from 'react';
import { useLoaderData } from "react-router-dom";

export default function CategorySearchbar() {
    const { baseCategoryData } = useLoaderData();
    const baseCategory = {
        value: baseCategoryData.pk,
        label: baseCategoryData.name
    };
    const categories = [baseCategory, ...baseCategoryData.subcategories.map((category) => {
        return {
            value: category.pk,
            label: category.name
        }
    })];

    return (
        <React.Fragment>
            
            <Select
                name={'category'}
                initial={baseCategory}
                options={categories}
                selectClassName={'app__header-select'}
            />
            <div className="app__header-searchbar">
                <div data-role="input">
                    <input type="text"/>
                </div>
            </div>
            <div className="app__functional-button app__functional-button--blue">
                <div className="icon icon--small">
                    <i className="material-icons">
                        search
                    </i>
                </div>
                Search
            </div>
        </React.Fragment>
    );
};