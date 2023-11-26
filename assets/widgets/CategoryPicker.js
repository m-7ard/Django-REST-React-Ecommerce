import React, { Fragment, useContext, useEffect, useState } from "react";

import { CategoryContext } from "../App";
import { normalizeData, getNormalizedDataHelpers, NormalizedData } from "../Utils";
import Drawer from "./Drawer";

export default function CategoryPicker({initial, name}) {
    const { allCategories, baseCategory } = useContext(CategoryContext);
    const NormalizedCategories = new NormalizedData({
        data: allCategories, 
        valueKey: 'pk', 
        labelKey: 'name', 
        parentKey: 'parent'
    });
    const topLevelCategories = NormalizedCategories.getSubChoices(baseCategory.pk);
    
    const [unconfirmedValue, setUnconfirmedValue] = useState(null);
    const [confirmedValue, setConfirmedValue] = useState(initial);
    const [open, setOpen] = useState(false);
    useEffect(() => {
        if (!open) {
            setUnconfirmedValue(confirmedValue);
        }
    }, [open])

    if (open) {
        return (
            <div className="overlay">
                <div className="prompt">
                    <div className="prompt__header">
                        <div className="prompt__title">
                            Choose Category
                        </div>
                        <div className="prompt__close" onMouseUp={() => setOpen(false)}>
                            <div className="icon icon--small">
                                <i className="material-icons">
                                    'close'
                                </i>
                            </div>
                        </div>
                    </div>
                    <hr className="app__divider" />
                    <div className="prompt__body">
                        <Drawer 
                            className={'form__drawer'} 
                            name={name} 
                            initialChoice={confirmedValue}
                            normalizedData={NormalizedCategories} 
                            topLevelChoices={topLevelCategories} 
                            parentChoiceHandle={(value) => {
                                const isLeaf = (NormalizedCategories.getSubChoices(value).length === 0);
                                if (!isLeaf) {
                                    setUnconfirmedValue(null);
                                }
                                else {
                                    setUnconfirmedValue(value);
                                };
                            }}
                        />
                    </div>
                    <hr className="app__divider" />
                    <div className="prompt__footer">
                        <div 
                            className={unconfirmedValue ? "prompt__confirm" : "prompt__confirm prompt__confirm--disabled" }
                            onClick={() => {
                                if (!unconfirmedValue) {
                                    return
                                };

                                setConfirmedValue(unconfirmedValue);
                                setOpen(false);
                            }}
                        >
                            Confirm
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    else {
        return (
            <Fragment>
                {confirmedValue && (
                    <div className="form__helper-text">
                        Current Category: {NormalizedCategories.getRouteString(confirmedValue)}
                    </div>
                )}
                <div className="form__action" onClick={() => setOpen(true)}>
                    Pick Category
                </div>
                <input type="hidden" value={confirmedValue} name={name}/>
            </Fragment>
        )
    }
}