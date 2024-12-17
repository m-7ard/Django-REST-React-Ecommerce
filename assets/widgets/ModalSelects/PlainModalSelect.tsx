import React, { useState } from 'react'
import { type NormalizedDataValue } from '../../Types'
import { type NormalizedData, usePicker } from '../../Utils'
import Prompt from '../../elements/Prompt'
import Icon from '../../elements/Icon'

interface PlainModalSelectProps {
    name: string
    title: string
    normalizedData: NormalizedData
    placeholder: string
    initial?: NormalizedDataValue
}

export default function PlainModalSelect ({ name, title, normalizedData, placeholder, initial }: PlainModalSelectProps): React.ReactNode {
    const [open, setOpen] = useState(false)
    const { stagedValue, confirmedValue, setStagedValue, setConfirmedValue } = usePicker(
        initial == null || initial === ''
            ? undefined
            : normalizedData.getChoice(initial)
    )
    const currentlySelected = stagedValue ?? confirmedValue
    const closeModal = (): void => {
        setStagedValue(undefined)
        setOpen(false)
    }

    return (
        <>
            <input name={name} defaultValue={confirmedValue?.value ?? undefined} type='hidden' />
            <div className="select@form" onClick={() => {
                setOpen(true)
            }}>
                <div className="select@form__root">
                    <div data-role="label">
                        {confirmedValue == null ? placeholder : confirmedValue.label}
                    </div>
                    <Icon name='web_asset' size='small' ignoreHeight />
                </div>
            </div>
            {
                open && (
                    <Prompt
                        title={title}
                        onClose={() => {
                            closeModal()
                        }}
                        body={
                            <div className='select@prompt'>
                                {
                                    normalizedData.data.map((item, i) => {
                                        const isSelected = currentlySelected?.value === item.value
                                        return (
                                            <div className={`select@prompt__option ${isSelected ? 'select@prompt__option--selected' : ''}`} key={i} onClick={() => {
                                                setStagedValue(item)
                                            }}>
                                                {item.label}
                                                {
                                                    isSelected && (
                                                        <Icon name='check_circle' size='small' ignoreHeight />
                                                    )
                                                }
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        }
                        footer={
                            <>
                                <div className='prompt__reset' onMouseUp={() => {
                                    setConfirmedValue(undefined)
                                    setStagedValue(undefined)
                                }}>
                                    Reset
                                </div>
                                <div className={`prompt__confirm ${currentlySelected == null ? 'prompt__confirm--disabled' : ''}`} onClick={() => {
                                    if (currentlySelected == null) {
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

export function PlainModalSelectWidget (props: Omit<PlainModalSelectProps, 'name'>): ({ name }: { name: string }) => React.ReactNode {
    return ({ name }: { name: string }) => PlainModalSelect({ name, ...props })
}
