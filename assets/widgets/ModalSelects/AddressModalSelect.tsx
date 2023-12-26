import React, { useState } from 'react'
import { type Address } from '../../Types'
import { usePicker } from '../../Utils'
import Prompt from '../../elements/Prompt'
import Icon from '../../elements/Icon'

interface AddressModalSelectProps {
    name: string
    title: string
    addressList: Address[]
    placeholder?: string
    initial?: number
}

export default function AddressModalSelect ({ name, title, addressList, placeholder, initial }: AddressModalSelectProps): React.ReactNode {
    const [open, setOpen] = useState(false)
    const { stagedValue, confirmedValue, setStagedValue, setConfirmedValue } = usePicker<Address>(
        initial == null
            ? undefined
            : addressList.find((address) => address.pk === initial)
    )
    const currentlySelected = stagedValue ?? confirmedValue
    const closeModal = (): void => {
        setStagedValue(undefined)
        setOpen(false)
    }

    return (
        <>
            <input name={name} defaultValue={confirmedValue?.pk} type='hidden' />
            <div className="select@form" onClick={() => {
                setOpen(true)
            }}>
                <div className="select@form__root">
                    <div data-role="label">
                        {confirmedValue == null ? placeholder : `${confirmedValue.name}, ${confirmedValue.street}, ${confirmedValue.locality}, ${confirmedValue.zip_code}, ${confirmedValue.country}`}
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
                            <div className='card-grid'>
                                {addressList.map((address, i) => {
                                    const isSelected = currentlySelected?.pk === address.pk
                                    return (
                                        <div className={`prop prop--vertical prop--highlighted address@prompt ${isSelected ? 'address@prompt--selected' : ''}`} key={i} onClick={() => {
                                            setStagedValue(address)
                                        }}>
                                            <div className="prop__header">
                                                <div className="prop__label">
                                                    {address.name}
                                                </div>
                                                {
                                                    isSelected && (
                                                        <Icon name='check_circle' size='small' ignoreHeight />
                                                    )
                                                }
                                            </div>
                                            <hr className="app__divider" />
                                            <div>
                                                <div className='prop__detail'> {address.street} </div>
                                                <div className='prop__detail'> {address.locality} </div>
                                                <div className='prop__detail'> {address.zip_code} </div>
                                                <div className='prop__detail'> {address.country_display} </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        }
                        footer={
                            <div className={`prompt__confirm ${currentlySelected == null ? 'prompt__confirm--disabled' : ''}`} onClick={() => {
                                if (currentlySelected == null) {
                                    return
                                }

                                setConfirmedValue(currentlySelected)
                                closeModal()
                            }}>
                                Confirm
                            </div>
                        }
                    />
                )
            }
        </>
    )
}

export function AddressModalSelectWidget (props: Omit<AddressModalSelectProps, 'name'>): ({ name }: { name: string }) => React.ReactNode {
    return ({ name }: { name: string }) => AddressModalSelect({ name, ...props })
}
