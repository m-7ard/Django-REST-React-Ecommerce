import React, {
    useContext, useState
} from 'react'
import { CategoryContext } from '../../Context'
import { NormalizedData, usePicker } from '../../Utils'
import { type NormalizedDataItem } from '../../Types'
import Icon from '../../elements/Icon'
import Prompt from '../../elements/Prompt'

interface CategoryModalSelectProps {
    initial?: number
    name: string
}

export default function CategoryModalSelect ({ initial, name }: CategoryModalSelectProps): React.ReactNode {
    const categoryData = useContext(CategoryContext)

    if (categoryData == null) {
        throw Error('categoryData is null or undefined. Provide at least one category.')
    }

    const { allCategories, baseCategory } = categoryData
    const NormalizedCategories = new NormalizedData({
        data: allCategories, valueKey: 'pk', labelKey: 'name', parentKey: 'parent'
    })
    const topLevelCategories = NormalizedCategories.getSubChoices(baseCategory.pk)

    const [open, setOpen] = useState(false)
    const { stagedValue, confirmedValue, setStagedValue, setConfirmedValue } = usePicker<NormalizedDataItem>(
        initial == null
            ? undefined
            : NormalizedCategories.getChoice(initial)
    )
    const currentlySelected = stagedValue ?? confirmedValue
    const currentlySelectedRoute = currentlySelected == null ? [] : NormalizedCategories.getRoute(currentlySelected.value)
    const closeModal = (): void => {
        setStagedValue(undefined)
        setOpen(false)
    }
    const [isConfirmable, setIsConfirmable] = useState(
        initial == null
            ? false
            : NormalizedCategories.getSubChoices(initial).length === 0
    )

    function Category ({ value, label }: NormalizedDataItem): React.ReactNode {
        const subChoices = NormalizedCategories.getSubChoices(value)
        const isSelected = currentlySelectedRoute.includes(value)

        if (subChoices.length > 0) {
            return (
                <div className='drawer__branch'>
                    <div className={`drawer__option ${isSelected ? 'is-selected' : ''}`} onClick={() => {
                        setStagedValue({ value, label })
                        setIsConfirmable(false)
                    }}>
                        {label}
                        <Icon name='chevron_right' size='small' ignoreHeight extraClass='drawer__chevron' />
                    </div>
                    {
                        isSelected && (
                            <div className='drawer__options'>
                                {
                                    subChoices.map((item, i) => {
                                        return <Category value={item.value} label={item.label} key={i} />
                                    })
                                }
                            </div>
                        )
                    }
                </div>
            )
        }
        else {
            return (
                <div className='drawer__branch'>
                    <div className={`drawer__option ${isSelected ? 'is-selected' : ''}`} onClick={() => {
                        setStagedValue({ value, label })
                        setIsConfirmable(true)
                    }}>
                        {label}
                        {
                            isSelected && <Icon name='check_circle' size='small' ignoreHeight />
                        }
                    </div>
                </div>
            )
        }
    }

    return (
        <>
            <input name={name} defaultValue={confirmedValue?.value} type='hidden' />
            <div className="select@form" onClick={() => {
                setOpen(true)
            }}>
                <div className="select@form__root">
                    <div data-role="label">
                        {confirmedValue == null ? 'Select a Category' : confirmedValue.label}
                    </div>
                    <Icon name='web_asset' size='small' ignoreHeight />
                </div>
            </div>
            {
                open && (
                    <Prompt
                        title={'Select a Category'}
                        onClose={() => {
                            closeModal()
                        }}
                        body={
                            <div className='drawer'>
                                {
                                    topLevelCategories.map((item, i) => {
                                        return <Category value={item.value} label={item.label} key={i} />
                                    })
                                }
                            </div>
                        }
                        footer={
                            <>
                                <div className='prompt__reset' onMouseUp={() => {
                                    setConfirmedValue(undefined)
                                    setStagedValue(undefined)
                                    setIsConfirmable(false)
                                }}>
                                    Reset
                                </div>
                                <div className={`prompt__confirm ${isConfirmable ? '' : 'prompt__confirm--disabled'}`} onClick={() => {
                                    if (!isConfirmable) {
                                        return
                                    }

                                    setConfirmedValue(currentlySelected)
                                    closeModal()
                                }}>
                                    Confirm
                                </div>
                            </>
                        }
                    />
                )
            }
        </>
    )
}

export function CategoryModalSelectWidget (props: Omit<CategoryModalSelectProps, 'name'>): ({ name }: { name: string }) => React.ReactNode {
    return ({ name }: { name: string }) => CategoryModalSelect({ name, ...props })
}
