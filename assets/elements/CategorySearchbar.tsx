import React from 'react'
import {
    Select
} from '../Widgets'
import { useCategoryContext } from '../Context'
import { NormalizedData } from '../Utils'

export default function CategorySearchbar (): React.ReactNode {
    const { baseCategory, allCategories } = useCategoryContext()
    const NormalizedCategories = new NormalizedData({
        data: allCategories,
        valueKey: 'pk',
        labelKey: 'name',
        parentKey: 'parent'
    })
    const topLevelCategories = NormalizedCategories.getSubChoices(baseCategory.pk)
    const normalizedBaseCategory = NormalizedCategories.getChoice(baseCategory.pk)

    return (
        <div className="app__header-search-bar">
            <Select
                name="category"
                initial={normalizedBaseCategory}
                options={topLevelCategories}
                className="app__header-category-select"
            />
            <div className="app__header-search-widget">
                <div className="app__header-search-field">
                    <div data-role="input">
                        <input type="text" />
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
    )
}
