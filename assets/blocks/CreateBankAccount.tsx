import React from 'react'
import GenericForm from '../elements/GenericForm'
import { useLoaderData, useNavigate } from 'react-router-dom'
import { CharInputWidget } from '../widgets/CharInput'
import { SelectWidget } from '../widgets/Select'
import { NormalizedData } from '../Utils'
import { type Address } from '../Types'
import { getRequestUserAddresses } from '../Fetchers'
import AddressPicker, { AddressPickerWidget } from '../widgets/AddressPicker'

export async function loader (): Promise<Address[]> {
    const addresses = await getRequestUserAddresses()
    return addresses
}

export default function CreateBankAccount (): React.ReactNode {
    const navigate = useNavigate()
    const addresses = useLoaderData() as Address[]

    return <GenericForm
        extraClass="pamphlet"
        method="POST"
        action='/api/bank-accounts/'
        title='Add Bank Account'
        button={{ label: 'Add Account' }}
        hasCSRF
        resettable
        fields={[
            {
                name: 'owner',
                label: 'Account Owner',
                widget: CharInputWidget({
                    type: 'text',
                    maxLength: 100
                })
            },
            {
                name: 'address',
                label: 'Address',
                widget: AddressPickerWidget({
                    data: addresses
                })
            }
        ]}

    />
}
