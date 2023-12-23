import React, { useState } from 'react'
import Prompt from '../elements/Prompt'
import { type Address } from '../Types'

interface AddressPickerProps {
    name: string
    data: Address[]
    initial?: number
}

export default function AddressPicker ({ name, data, initial }: AddressPickerProps): React.ReactNode {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState(initial)
    const currentChoice = value == null ? null : data.find((address) => address.pk === value)

    if (open) {
        return (
            <Prompt
                title="Select An Address"
                onClose={() => {
                    setOpen(false)
                }}
                body={
                    <>
                        <div className='prop prop--vertical prop--highlighted'>
                            <div className='prop prop__header'>
                                <div className='prop__title'>
                                    {}
                                </div>
                            </div>
                        </div>
                    </>
                }
            />
        )
    }
    else {
        return (
            <>
                <div>
                    <span className='prop__label'>
                        Current Address:
                    </span>
                    <span className='prop__detail'>
                        {currentChoice?.name}
                    </span>
                </div>
                <div className='form__action'onClick={() => {
                    setOpen(true)
                }}>
                    Select Address
                </div>
            </>
        )
    }
}

export function AddressPickerWidget (props: Omit<AddressPickerProps, 'name'>): ({ name }: { name: string }) => React.ReactNode {
    return ({ name }: { name: string }) => AddressPicker({ name, ...props })
}