import React, {
    useContext, useEffect, useState
} from 'react'

import { CategoryContext } from '../Context'
import { NormalizedData } from '../Utils'
import Drawer from './Drawer'

interface CategoryPickerInterface {
    initial: number
    name: string
}

export default function CategoryPicker ({ initial, name }: CategoryPickerInterface): React.ReactNode {
    const categoryData = useContext(CategoryContext)

    if (categoryData == null) {
        throw Error('categoryData is null or undefined. Provide at least one category.')
    }

    const allCategories = categoryData.allCategories
    const baseCategory = categoryData.baseCategory

    const NormalizedCategories = new NormalizedData({
        data: allCategories,
        valueKey: 'pk',
        labelKey: 'name',
        parentKey: 'parent'
    })
    const topLevelCategories = NormalizedCategories.getSubChoices(baseCategory.pk)

    const [unconfirmedValue, setUnconfirmedValue] = useState<number | null>(null)
    const [confirmedValue, setConfirmedValue] = useState(initial)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (!open) {
            setUnconfirmedValue(confirmedValue)
        }
    }, [open])

    if (open) {
        return (
            <div className="overlay">
                <div className="prompt prop prop--vertical">
                    <div className="prop__header">
                        <div className="prop__title">
                            Choose Category
                        </div>
                        <div className="prompt__close" onMouseUp={() => {
                            setOpen(false)
                        }}>
                            <div className="icon icon--small">
                                <i className="material-icons">
                                    close
                                </i>
                            </div>
                        </div>
                    </div>
                    <hr className="app__divider" />
                    <div className="prompt__body grow">
                        <Drawer
                            className="form__drawer"
                            name={name}
                            initialChoice={confirmedValue}
                            normalizedData={NormalizedCategories}
                            topLevelChoices={topLevelCategories}
                            parentChoiceHandle={(value) => {
                                const isLeaf = (NormalizedCategories.getSubChoices(value).length === 0)
                                if (!isLeaf) {
                                    setUnconfirmedValue(null)
                                }
                                else {
                                    setUnconfirmedValue(value)
                                }
                            }}
                        />
                    </div>
                    <hr className="app__divider" />
                    <div className="prop__footer">
                        <div
                            className={
                                (unconfirmedValue == null) ? 'prompt__confirm prompt__confirm--disabled' : 'prompt__confirm'
                            }
                            onClick={() => {
                                if (unconfirmedValue == null) {
                                    return
                                }

                                setConfirmedValue(unconfirmedValue)
                                setOpen(false)
                            }}
                        >
                            Confirm
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            {(confirmedValue != null) && (
                <div className="form__helper-text">
                    Current Category:
                    {' '}
                    {NormalizedCategories.getRouteString(confirmedValue)}
                </div>
            )}
            <div className="form__action" onClick={() => {
                setOpen(true)
            }}>
                Pick Category
            </div>
            <input type="hidden" value={confirmedValue} name={name} />
        </>
    )
}
