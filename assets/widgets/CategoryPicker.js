import React, { Fragment, useContext, useState } from "react";

import { CategoryContext } from "../App";
import { normalizeData, normalizedDataHelpers } from "../Utils";
import Drawer from "./Drawer";

export default function CategoryPicker({initial, name}) {
    const { allCategories, baseCategory } = useContext(CategoryContext);
    const sanitizedCategories = normalizeData({
        data: allCategories, 
        valueKey: 'pk', 
        labelKey: 'name', 
        parentKey: 'parent'
    })
    const topLevelCategories = sanitizedCategories.filter(({parent}) => {
        return parent === baseCategory.pk;
    });
    
    const { getRouteString } = normalizedDataHelpers(sanitizedCategories);
    const [value, setValue] = useState(269);
    const [open, setOpen] = useState(false);
    /* reuse form(?) also make confirmation for prompt */

    if (open) {
        return (
            <div className="overlay">
                <div className="prompt">
                    <Drawer 
                        className={'form__drawer'} 
                        name={name} 
                        normalizedData={sanitizedCategories} 
                        topLevelChoices={topLevelCategories} 
                        
                    />
                </div>
            </div>
        )
    }
    else {
        return (
            <Fragment>
                {value && <div className="form__helper-text">
                    Current Category: {getRouteString(value)}
                </div>}
                <div className="form__action" onClick={() => setOpen(true)}>
                    Pick Category
                </div>

            </Fragment>
        )
    }
}