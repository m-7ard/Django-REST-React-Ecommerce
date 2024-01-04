import React from 'react'
import GenericForm from '../../elements/GenericForm'
import { useLoaderData, useNavigate } from 'react-router-dom'
import { CharInputWidget } from '../../widgets/CharInput'
import { type Address } from '../../Types'
import { getRequestUserAddresses } from '../../Fetchers'
import { AddressModalSelectWidget } from '../../widgets/ModalSelects/AddressModalSelect'

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
                name: 'iban',
                label: 'IBAN',
                widget: CharInputWidget({
                    type: 'text',
                    maxLength: 32
                })
            },
            {
                name: 'address',
                label: 'Address',
                widget: AddressModalSelectWidget({
                    addressList: addresses,
                    title: 'Select an Address',
                    placeholder: 'Select an Address'
                })
            }
        ]}
        onSuccess={async () => {
            navigate('/bank-accounts/')
        }}
    />
}
